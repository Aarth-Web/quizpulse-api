import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuthStore } from "../features/auth/store";
import { updateMe } from "../lib/api";
import { getApiErrorMessage } from "../types/api";
import { useToastStore } from "../components/toastStore";

export function ProfilePage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const addToast = useToastStore((state) => state.addToast);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialFetchPending, setIsInitialFetchPending] =
    useState(!currentUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      return;
    }

    void fetchCurrentUser().then((result) => {
      setIsInitialFetchPending(false);
      if (!result.ok) {
        setError(result.error ?? "Unable to load profile.");
      }
    });
  }, [currentUser, fetchCurrentUser]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const avatarIndex = Number(formData.get("avatarIndex") ?? 0);

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateMe({ name, avatarIndex });
      setIsSubmitting(false);
      if (result.error || !result.data) {
        const message = getApiErrorMessage(
          result.error,
          "Unable to update profile.",
        );
        setError(message);
        addToast(message, "error");
        return;
      }

      setCurrentUser(result.data);
      addToast("Profile updated.", "success");
    } catch {
      setIsSubmitting(false);
      const message = "Unable to update profile.";
      setError(message);
      addToast(message, "error");
    }
  }

  if (!currentUser && isInitialFetchPending) {
    return <p>Loading profile...</p>;
  }

  return (
    <section className="panel">
      <h2>Profile</h2>
      <p>Manage your account details.</p>
      {error ? <p className="feedback-error">{error}</p> : null}

      <form onSubmit={handleSubmit} key={currentUser?.id ?? "profile-form"}>
        <label>
          Name
          <input required name="name" defaultValue={currentUser?.name ?? ""} />
        </label>
        <label>
          Avatar Index
          <input
            name="avatarIndex"
            type="number"
            min={0}
            defaultValue={currentUser?.avatarIndex ?? 0}
          />
        </label>
        <label>
          Email
          <input disabled value={currentUser?.email ?? ""} />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
}
