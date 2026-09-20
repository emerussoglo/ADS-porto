import ContentPage from "../../components/ContentPage";

export default function AgendaPage() {
  return (
    <ContentPage
      eyebrow="Événements et activités"
      title="Les prochains"
      accent="rendez-vous."
      intro="Formations, réunions, célébrations et activités pastorales : retrouve ici les moments qui font vivre la fraternité ADS."
      action={{ label: "Proposer une activité", href: "/about#contact" }}
      sections={[
        {
          title: "18 octobre · Veillée",
          text: "Paroisse Saint Michel · Une soirée de prière et de fraternité.",
          icon: "fa-moon",
        },
        {
          title: "02 novembre · Formation",
          text: "Maison ADS, Porto-Novo · Leadership et service communautaire.",
          icon: "fa-calendar-days",
        },
        {
          title: "16 novembre · Journée ADS",
          text: "Diocèse de Porto-Novo · Une journée pour se retrouver et célébrer.",
          icon: "fa-people-group",
        },
      ]}
    />
  );
}
