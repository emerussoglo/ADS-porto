import MemberSection from "@/components/member/MemberSection";
import styles from "../PrivateSpace.module.css";

export default function MemberSanctionsPage() {
  return (
    <MemberSection title="Historique des sanctions">
      <p className={styles.empty}>
        <i className="fa-solid fa-circle-check" aria-hidden="true" /> Aucune sanction enregistrée pour le moment. Les décisions et leur suivi seront visibles ici lorsqu’ils seront ajoutés par l’administration.
      </p>
    </MemberSection>
  );
}
