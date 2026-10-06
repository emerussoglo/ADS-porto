import MemberSection from "@/components/member/MemberSection";
import styles from "../PrivateSpace.module.css";

export default function MemberDocumentsPage() {
  return (
    <MemberSection title="Mes documents">
      <p className={styles.empty}>
        <i className="fa-solid fa-circle-info" aria-hidden="true" /> Cette rubrique est prête à recevoir tes données ADS. Les éléments seront alimentés par l’administration.
      </p>
    </MemberSection>
  );
}
