import ContentPage from "../../components/ContentPage";

export default function LearningPage() {
  return (
    <ContentPage
      eyebrow="Formations et apprentissage"
      title="Apprendre pour"
      accent="mieux servir."
      intro="Retrouve les formations, documents pédagogiques et témoignages qui nourrissent le parcours des jeunes leaders ADS."
      sections={[
        {
          title: "Foi & spiritualité",
          text: "Des temps de formation pour approfondir sa foi et faire grandir son discernement.",
          icon: "fa-book-bible",
        },
        {
          title: "Leadership",
          text: "Des outils concrets pour prendre des responsabilités avec écoute, courage et méthode.",
          icon: "fa-graduation-cap",
        },
        {
          title: "Ressources",
          text: "Supports, comptes rendus et documents à consulter selon ton niveau ADS.",
          icon: "fa-file-lines",
        },
      ]}
    />
  );
}
