import ContentPage from "../../components/ContentPage";

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="Notre histoire et nos valeurs"
      title="Une fraternité"
      accent="qui fait grandir."
      intro="ADS, Fraternité, Jeunes Leaders est un mouvement catholique de jeunesse du Diocèse de Porto-Novo. Nous formons des jeunes enracinés dans la foi, le service et l'excellence chrétienne."
      action={{ label: "Rejoindre le mouvement", href: "/inscription" }}
      sections={[
        {
          title: "Notre mission",
          text: "Accompagner chaque jeune dans un parcours humain et spirituel concret, au sein de sa paroisse et de sa communauté.",
          icon: "fa-cross",
        },
        {
          title: "Nos autorités",
          text: "Un mouvement guidé par des responsables engagés qui transmettent, encouragent et donnent l'exemple.",
          icon: "fa-user-tie",
        },
        {
          title: "Nos valeurs",
          text: "Service, Union et Vie Exemplaire : trois repères pour faire de la foi une force quotidienne.",
          icon: "fa-heart",
        },
      ]}
    />
  );
}
