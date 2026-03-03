import { createInteractiveStars } from "./Stars";

export interface ReviewFormData {
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string;
  body: string;
}

export function createReviewForm(
  onSubmit: (data: ReviewFormData) => Promise<{ message: string }>
): HTMLFormElement {
  const form = document.createElement("form");
  let selectedRating = 0;
  let msgEl: HTMLDivElement | null = null;

  function clearMessage() {
    if (msgEl) {
      msgEl.remove();
      msgEl = null;
    }
  }

  function showMessage(text: string, type: "success" | "error") {
    clearMessage();
    msgEl = document.createElement("div");
    msgEl.className = type === "success" ? "msg-success" : "msg-error";
    msgEl.textContent = text;
    form.prepend(msgEl);
  }

  // Name + Email row
  const nameEmailRow = document.createElement("div");
  nameEmailRow.className = "form-row";

  const nameGroup = document.createElement("div");
  nameGroup.className = "form-group";
  const nameLabel = document.createElement("label");
  nameLabel.className = "form-label";
  nameLabel.textContent = "Name";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "form-input";
  nameInput.required = true;
  nameInput.placeholder = "Your name";
  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);

  const emailGroup = document.createElement("div");
  emailGroup.className = "form-group";
  const emailLabel = document.createElement("label");
  emailLabel.className = "form-label";
  emailLabel.textContent = "Email";
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.className = "form-input";
  emailInput.required = true;
  emailInput.placeholder = "Your email";
  emailGroup.appendChild(emailLabel);
  emailGroup.appendChild(emailInput);

  nameEmailRow.appendChild(nameGroup);
  nameEmailRow.appendChild(emailGroup);

  // Rating
  const ratingGroup = document.createElement("div");
  ratingGroup.className = "form-group";
  const ratingLabel = document.createElement("label");
  ratingLabel.className = "form-label";
  ratingLabel.textContent = "Rating";
  const starsEl = createInteractiveStars((r) => {
    selectedRating = r;
  });
  ratingGroup.appendChild(ratingLabel);
  ratingGroup.appendChild(starsEl);

  // Title
  const titleGroup = document.createElement("div");
  titleGroup.className = "form-group";
  const titleLabel = document.createElement("label");
  titleLabel.className = "form-label";
  titleLabel.textContent = "Title";
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.className = "form-input";
  titleInput.required = true;
  titleInput.placeholder = "Review title";
  titleGroup.appendChild(titleLabel);
  titleGroup.appendChild(titleInput);

  // Body
  const bodyGroup = document.createElement("div");
  bodyGroup.className = "form-group";
  const bodyLabel = document.createElement("label");
  bodyLabel.className = "form-label";
  bodyLabel.textContent = "Review";
  const bodyInput = document.createElement("textarea");
  bodyInput.className = "form-input";
  bodyInput.required = true;
  bodyInput.placeholder = "Write your review...";
  bodyGroup.appendChild(bodyLabel);
  bodyGroup.appendChild(bodyInput);

  // Photo upload
  const photoGroup = document.createElement("div");
  photoGroup.className = "form-group";
  const photoLabel = document.createElement("label");
  photoLabel.className = "form-file-label";
  photoLabel.textContent = "Photos (optional)";
  const photoInput = document.createElement("input");
  photoInput.type = "file";
  photoInput.className = "form-file-input";
  photoInput.accept = "image/*";
  photoInput.multiple = true;
  const photoHint = document.createElement("div");
  photoHint.className = "form-file-hint";
  photoHint.textContent = "Up to 5 images, max 5MB each";
  photoGroup.appendChild(photoLabel);
  photoGroup.appendChild(photoInput);
  photoGroup.appendChild(photoHint);

  // Submit button
  const actions = document.createElement("div");
  actions.className = "form-actions";
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "frankly-btn";
  submitBtn.textContent = "Submit Review";
  actions.appendChild(submitBtn);

  form.appendChild(nameEmailRow);
  form.appendChild(ratingGroup);
  form.appendChild(titleGroup);
  form.appendChild(bodyGroup);
  form.appendChild(photoGroup);
  form.appendChild(actions);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();

    if (selectedRating === 0) {
      showMessage("Please select a rating.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      const result = await onSubmit({
        reviewerName: nameInput.value.trim(),
        reviewerEmail: emailInput.value.trim(),
        rating: selectedRating,
        title: titleInput.value.trim(),
        body: bodyInput.value.trim(),
      });
      showMessage(result.message, "success");
      form.reset();
      selectedRating = 0;
      // Re-render stars to clear selection
      const newStars = createInteractiveStars((r) => {
        selectedRating = r;
      });
      starsEl.replaceWith(newStars);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit review.";
      showMessage(message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Review";
    }
  });

  return form;
}
