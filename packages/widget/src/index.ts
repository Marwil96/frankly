import { styles } from "./styles";
import { fetchReviews, fetchStats, submitReview } from "./api";
import { createReviewList } from "./components/ReviewList";
import { createReviewForm } from "./components/ReviewForm";

(function () {
  const script = document.currentScript as HTMLScriptElement | null;
  if (!script) return;

  const apiKey = script.getAttribute("data-frankly-api-key");
  const sku = script.getAttribute("data-frankly-sku");
  let apiUrl = script.getAttribute("data-frankly-api-url");
  const locale = script.getAttribute("data-frankly-locale") || undefined;

  if (!apiKey || !sku) {
    console.error("[Frankly] Missing data-frankly-api-key or data-frankly-sku");
    return;
  }

  // Derive API URL from script src if not provided
  if (!apiUrl) {
    try {
      const srcUrl = new URL(script.src);
      apiUrl = srcUrl.origin;
    } catch {
      apiUrl = window.location.origin;
    }
  }

  // Create container
  const container = document.createElement("div");
  container.id = "frankly-reviews";
  script.parentNode!.insertBefore(container, script.nextSibling);

  // Attach shadow DOM
  const shadow = container.attachShadow({ mode: "open" });

  // Inject styles
  const styleEl = document.createElement("style");
  styleEl.textContent = styles;
  shadow.appendChild(styleEl);

  // Wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "frankly-wrapper";
  shadow.appendChild(wrapper);

  // Reviews card
  const reviewsCard = document.createElement("div");
  reviewsCard.className = "frankly-card";

  const reviewsHeader = document.createElement("div");
  reviewsHeader.className = "frankly-card-header";
  reviewsHeader.textContent = "Customer Reviews";
  reviewsCard.appendChild(reviewsHeader);

  const reviewsContent = document.createElement("div");
  reviewsContent.innerHTML = '<div class="loading">Loading reviews...</div>';
  reviewsCard.appendChild(reviewsContent);
  wrapper.appendChild(reviewsCard);

  // Form card
  const formCard = document.createElement("div");
  formCard.className = "frankly-card";

  const formHeader = document.createElement("div");
  formHeader.className = "frankly-card-header";
  formHeader.textContent = "Write a Review";
  formCard.appendChild(formHeader);

  const formContent = document.createElement("div");
  formCard.appendChild(formContent);
  wrapper.appendChild(formCard);

  let currentPage = 1;
  const pageSize = 10;

  async function loadReviews() {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        fetchReviews(apiUrl!, apiKey!, sku!, currentPage, pageSize),
        fetchStats(apiUrl!, apiKey!, sku!),
      ]);

      reviewsContent.innerHTML = "";
      const list = createReviewList(reviewsRes.reviews, statsRes, locale);
      reviewsContent.appendChild(list);

      // Pagination
      const totalPages = Math.ceil(reviewsRes.total / pageSize);
      if (totalPages > 1) {
        const pagination = document.createElement("div");
        pagination.className = "pagination";

        const prevBtn = document.createElement("button");
        prevBtn.className = "frankly-btn frankly-btn-secondary";
        prevBtn.textContent = "\u2190 Prev";
        prevBtn.disabled = currentPage <= 1;
        prevBtn.addEventListener("click", () => {
          if (currentPage > 1) {
            currentPage--;
            loadReviews();
          }
        });

        const info = document.createElement("span");
        info.className = "pagination-info";
        info.textContent = `Page ${currentPage} of ${totalPages}`;

        const nextBtn = document.createElement("button");
        nextBtn.className = "frankly-btn frankly-btn-secondary";
        nextBtn.textContent = "Next \u2192";
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.addEventListener("click", () => {
          if (currentPage < totalPages) {
            currentPage++;
            loadReviews();
          }
        });

        pagination.appendChild(prevBtn);
        pagination.appendChild(info);
        pagination.appendChild(nextBtn);
        reviewsContent.appendChild(pagination);
      }
    } catch (err) {
      reviewsContent.innerHTML = "";
      const errDiv = document.createElement("div");
      errDiv.className = "msg-error";
      errDiv.textContent = "Failed to load reviews.";
      reviewsContent.appendChild(errDiv);
    }
  }

  // Render form
  const form = createReviewForm(async (data) => {
    const result = await submitReview(apiUrl!, apiKey!, {
      sku: sku!,
      ...data,
    });
    // Refresh reviews after submission
    currentPage = 1;
    loadReviews();
    return result;
  });
  formContent.appendChild(form);

  // Initial load
  loadReviews();
})();
