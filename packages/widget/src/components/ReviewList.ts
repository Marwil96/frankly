import { createStars } from "./Stars";
import type { Review, Stats } from "../api";

export function createReviewList(
  reviews: Review[],
  stats: Stats,
  locale?: string
): HTMLDivElement {
  const container = document.createElement("div");

  // Stats header
  const statsHeader = document.createElement("div");
  statsHeader.className = "stats-header";

  const avgEl = document.createElement("div");
  avgEl.className = "stats-avg";
  avgEl.textContent = stats.averageRating
    ? stats.averageRating.toFixed(1)
    : "0.0";

  const infoEl = document.createElement("div");
  infoEl.className = "stats-info";

  const starsRow = createStars(Math.round(stats.averageRating));

  const countEl = document.createElement("div");
  countEl.className = "stats-count";
  countEl.textContent = `${stats.totalReviews} review${stats.totalReviews !== 1 ? "s" : ""}`;

  infoEl.appendChild(starsRow);
  infoEl.appendChild(countEl);

  if (locale) {
    const localeEl = document.createElement("div");
    localeEl.className = "stats-locale";
    localeEl.textContent = `Locale: ${locale}`;
    infoEl.appendChild(localeEl);
  }

  statsHeader.appendChild(avgEl);
  statsHeader.appendChild(infoEl);
  container.appendChild(statsHeader);

  // Distribution bar chart
  if (stats.totalReviews > 0) {
    const distEl = document.createElement("div");
    distEl.className = "distribution";

    for (let i = 5; i >= 1; i--) {
      const count = stats.distribution[i] || 0;
      const pct =
        stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

      const row = document.createElement("div");
      row.className = "dist-row";

      const label = document.createElement("span");
      label.className = "dist-label";
      label.textContent = String(i);

      const starIcon = document.createElement("span");
      starIcon.className = "dist-star";
      starIcon.textContent = "\u2605";

      const barBg = document.createElement("div");
      barBg.className = "dist-bar-bg";
      const barFill = document.createElement("div");
      barFill.className = "dist-bar-fill";
      barFill.style.width = `${pct}%`;
      barBg.appendChild(barFill);

      const countSpan = document.createElement("span");
      countSpan.className = "dist-count";
      countSpan.textContent = String(count);

      row.appendChild(label);
      row.appendChild(starIcon);
      row.appendChild(barBg);
      row.appendChild(countSpan);
      distEl.appendChild(row);
    }

    container.appendChild(distEl);
  }

  // Review list
  const listEl = document.createElement("div");
  listEl.className = "review-list";

  if (reviews.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No reviews yet. Be the first to leave a review!";
    listEl.appendChild(empty);
  } else {
    for (const review of reviews) {
      const item = document.createElement("div");
      item.className = "review-item";

      const header = document.createElement("div");
      header.className = "review-header";

      const headerLeft = document.createElement("div");
      headerLeft.style.display = "flex";
      headerLeft.style.alignItems = "center";
      headerLeft.style.gap = "8px";

      const starsEl = createStars(review.rating);
      headerLeft.appendChild(starsEl);

      const titleEl = document.createElement("span");
      titleEl.className = "review-title";
      titleEl.textContent = review.title;
      headerLeft.appendChild(titleEl);

      if (review.verifiedPurchase) {
        const badge = document.createElement("span");
        badge.className = "verified-badge";
        const checkIcon = document.createElement("span");
        checkIcon.className = "verified-badge-icon";
        checkIcon.textContent = "\u2713";
        badge.appendChild(checkIcon);
        const badgeText = document.createTextNode("Verified");
        badge.appendChild(badgeText);
        headerLeft.appendChild(badge);
      }

      header.appendChild(headerLeft);

      const body = document.createElement("div");
      body.className = "review-body";
      body.textContent = review.body;

      const meta = document.createElement("div");
      meta.className = "review-meta";
      const date = new Date(review.createdAt);
      const nameSpan = document.createElement("span");
      nameSpan.textContent = review.reviewerName;
      meta.appendChild(nameSpan);

      const sep = document.createElement("span");
      sep.className = "review-meta-sep";
      sep.textContent = "\u00B7";
      meta.appendChild(sep);

      const dateSpan = document.createElement("span");
      dateSpan.textContent = date.toLocaleDateString();
      meta.appendChild(dateSpan);

      if (review.locale) {
        const sep2 = document.createElement("span");
        sep2.className = "review-meta-sep";
        sep2.textContent = "\u00B7";
        meta.appendChild(sep2);

        const localeSpan = document.createElement("span");
        localeSpan.textContent = review.locale.toUpperCase();
        meta.appendChild(localeSpan);
      }

      item.appendChild(header);
      item.appendChild(body);

      // Photo thumbnails
      if (review.photos && review.photos.length > 0) {
        const photosEl = document.createElement("div");
        photosEl.className = "review-photos";
        for (const photo of review.photos) {
          const img = document.createElement("img");
          img.className = "review-photo-thumb";
          img.src = photo.url;
          img.alt = "Review photo";
          img.loading = "lazy";
          img.addEventListener("click", () => {
            window.open(photo.url, "_blank");
          });
          photosEl.appendChild(img);
        }
        item.appendChild(photosEl);
      }

      item.appendChild(meta);
      listEl.appendChild(item);
    }
  }

  container.appendChild(listEl);
  return container;
}
