import MemberSection from "@/components/member/MemberSection";
import styles from "../PrivateSpace.module.css";

export default function MemberMeritsPage() {
  return (
    <MemberSection title="Mes mérites">
      <p className={styles.empty}>
        Les mérites et distinctions que l’administration t’attribuera seront affichés ici.
      </p>
    </MemberSection>
  );
}
