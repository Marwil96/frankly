export function createStars(rating: number, max: number = 5): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "stars";
  for (let i = 1; i <= max; i++) {
    const star = document.createElement("span");
    star.className = "star" + (i <= rating ? " filled" : "");
    star.textContent = "\u2605";
    span.appendChild(star);
  }
  return span;
}

export function createInteractiveStars(
  onChange: (rating: number) => void
): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "stars-interactive";
  let currentRating = 0;

  function render(highlighted: number) {
    span.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.className = "star" + (i <= highlighted ? " filled" : "");
      star.textContent = "\u2605";
      star.addEventListener("mouseenter", () => render(i));
      star.addEventListener("click", () => {
        currentRating = i;
        onChange(i);
        render(i);
      });
      span.appendChild(star);
    }
  }

  span.addEventListener("mouseleave", () => render(currentRating));
  render(0);

  return span;
}
