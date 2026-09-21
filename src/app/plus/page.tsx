import styles from "../../components/Showcase.module.css";

export default function PlusPage() {
  return <main className={styles.page}>
    <section className={styles.hero}><p className={styles.eyebrow}><span /> Notre rayonnement</p><h1>L&apos;ADS<br /><em>au-delà.</em></h1><p className={styles.lead}>Œuvres, créations, projets et distinctions : tout ce qui prolonge l&apos;engagement des jeunes leaders dans la société.</p></section>
    <section className={styles.section}><div className={styles.cards}>{[["fa-hands-holding-heart", "Nos œuvres", "Les actions caritatives et sociales menées avec les communautés."], ["fa-film", "Nos créations", "Musique, vidéo, art et productions portées par les talents ADS."], ["fa-diagram-project", "Nos projets", "Les projets en cours et ceux déjà réalisés par nos équipes."]].map(([icon,title,text]) => <article className={styles.card} key={title}><i className={`fa-solid ${icon}`} /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className={styles.sectionAlt}><div className={styles.heading}><h2>Hall of Fame</h2><p>Une vitrine de gratitude pour reconnaître un parcours, un service ou une distinction exceptionnelle.</p></div><div className={styles.people}>{[["A", "Membre distingué", "Distinction à venir"], ["J", "Jeune leader", "Service remarquable"], ["E", "Équipe ADS", "Projet valorisé"], ["+", "Votre nom ici", "Mérite à attribuer"]].map(([letter,name,reason]) => <article className={styles.person} key={name}><div className={styles.avatar}>{letter}</div><h3>{name}</h3><p>{reason}</p></article>)}</div><p className={styles.notice} style={{marginTop:28}}><i className="fa-solid fa-award" /> Chaque distinction affichera la photo, le titre, la raison de la reconnaissance et le message de valorisation ajoutés par l&apos;administration.</p></section>
  </main>;
  /*
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
  ); */
}
