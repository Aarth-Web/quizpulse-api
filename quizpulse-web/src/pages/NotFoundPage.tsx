import { Link } from "react-router-dom";
import { SectionHeader } from "../components/SectionHeader";

export function NotFoundPage() {
  return (
    <section className="empty-state" role="status">
      <SectionHeader
        title="Page Not Found"
        subtitle="The page you requested does not exist."
      />
      <Link className="inline-link" to="/">
        Go to Home
      </Link>
    </section>
  );
}
