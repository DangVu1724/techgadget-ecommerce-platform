import { useEffect, useMemo, useState } from "react";

const STAR_OPTIONS = [
  { label: "All", value: "all" },
  { label: "5 Stars", value: 5 },
  { label: "4 Stars", value: 4 },
  { label: "3 Stars", value: 3 },
  { label: "2 Stars", value: 2 },
  { label: "1 Star", value: 1 },
];

const AVATAR_COLORS = [
  "bg-amber-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-fuchsia-500",
];

const buildInitial = (name) => {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
};

const pickAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric" });
};

const StarRow = ({ rating }) => (
  <div className="flex items-center gap-1 text-amber-500">
    {Array.from({ length: 5 }).map((_, index) => (
      <span key={index} className={index < rating ? "text-amber-500" : "text-slate-300"}>
        ★
      </span>
    ))}
  </div>
);

const ReviewAvatar = ({ name, avatarUrl }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = buildInitial(name);
  const colorClass = useMemo(() => pickAvatarColor(name), [name]);

  if (!avatarUrl || imageFailed) {
    return (
      <div
        className={`h-12 w-12 rounded-full ${colorClass} flex items-center justify-center text-white font-semibold`}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      className="h-12 w-12 rounded-full object-cover"
      onError={() => setImageFailed(true)}
    />
  );
};

const ReviewCard = ({ review }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-4">
      <ReviewAvatar name={review.userName} avatarUrl={review.avatarUrl} />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{review.userName}</p>
            <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
          </div>
          <StarRow rating={review.rating} />
        </div>
      </div>
    </div>
    <p className="mt-4 text-sm text-slate-700">{review.comment}</p>
  </div>
);

export default function ReviewSection({
  productId,
  isLoggedIn,
  authToken,
  initialReviews = [],
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState("all");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    const ratingQuery = filter === "all" ? "" : `?rating=${filter}`;
    fetch(`/api/reviews/${productId}${ratingQuery}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((payload) => setReviews(payload?.data ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [productId, filter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!productId || !rating || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
        }),
      });

      const payload = await response.json();
      if (payload?.data) {
        setReviews((prev) => [payload.data, ...prev]);
        setRating(5);
        setComment("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Customer Reviews</h2>
          <p className="text-sm text-slate-500">What people think about this product</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STAR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                filter === option.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 md:col-span-2">
            No reviews yet. Be the first to share your experience.
          </div>
        ) : (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </div>

      {!isLoggedIn ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-700">Please Login to review this product</p>
          <a
            href="/login"
            className="mt-3 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go to Login
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Add a Review</h3>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Your rating *</label>
              <div className="mt-2 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      className={`text-2xl ${
                        starValue <= rating ? "text-amber-500" : "text-slate-300"
                      }`}
                      aria-label={`Set rating ${starValue}`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Write your review *</label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
                placeholder="Share your thoughts..."
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </section>
  );
}
