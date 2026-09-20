import ContentPage from "../../components/ContentPage";

export default function PlusPage() {
  return (
    <ContentPage
      eyebrow="Notre rayonnement"
      title="L'ADS"
      accent="au-delà."
      intro="Découvre les œuvres, productions, actions, projets et mérites qui prolongent l'engagement des jeunes leaders dans la société."
      sections={[
        {
          title: "Nos œuvres",
          text: "Des actions caritatives et sociales menées avec les communautés les plus proches.",
          icon: "fa-hands-holding-heart",
        },
        {
          title: "Nos productions",
          text: "Musique, vidéo, art et créations culturelles portées par les talents ADS.",
          icon: "fa-film",
        },
        {
          title: "Hall of Fame",
          text: "Les membres qui ont marqué l'histoire du mouvement par leur service et leur exemple.",
          icon: "fa-trophy",
        },
      ]}
    />
  );
}
