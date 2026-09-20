import ContentPage from "../../components/ContentPage";

export default function RegistrationPage() {
  return (
    <ContentPage
      eyebrow="Rejoins la famille ADS"
      title="Ta place est"
      accent="parmi nous."
      intro="L'inscription ADS est un parcours d'accueil, de formation et d'engagement. Commence par rencontrer ton encadreur ou écris-nous pour être accompagné(e)."
      action={{ label: "Contacter l'équipe", href: "/about#contact" }}
      sections={[
        {
          title: "Découvrir",
          text: "Comprendre nos valeurs et choisir le niveau qui correspond à ton âge et à ton parcours.",
          icon: "fa-compass",
        },
        {
          title: "S'engager",
          text: "Participer aux activités, formations et actions de ta paroisse avec ton équipe.",
          icon: "fa-hands-helping",
        },
        {
          title: "Grandir",
          text: "Avancer dans les niveaux Minime, Cadet puis Junior / Noyau et transmettre à ton tour.",
          icon: "fa-arrow-up-right-dots",
        },
      ]}
    />
  );
}
