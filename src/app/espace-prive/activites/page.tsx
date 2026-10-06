import MemberSection from "@/components/member/MemberSection";
import styles from "../PrivateSpace.module.css";

export default function MemberActivitiesPage() {
  return (
    <MemberSection title="Mes activités">
      <p className={styles.empty}>
        Les activités et présences associées à ton compte apparaîtront ici.
      </p>
    </MemberSection>
  );
}
