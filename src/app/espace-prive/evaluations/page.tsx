import MemberSection from "@/components/member/MemberSection";
import styles from "../PrivateSpace.module.css";

export default function MemberEvaluationsPage() {
  return (
    <MemberSection title="Mes évaluations">
      <p className={styles.empty}>
        Tes évaluations et les étapes de progression validées par les responsables seront visibles ici.
      </p>
    </MemberSection>
  );
}
