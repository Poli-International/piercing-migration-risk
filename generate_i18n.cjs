const fs = require('fs');

const en = JSON.parse(fs.readFileSync('temp_en_keys.json', 'utf8'));

// Helper to remove any spaced em-dash or en-dash
function sanitize(str) {
  return str.replace(/ — /g, ': ').replace(/ – /g, ': ').replace(/—/g, '-');
}

// Ensure en has no spaced dashes
for (const k of Object.keys(en)) {
  en[k] = sanitize(en[k]);
}

// Load existing es, nl, pt from i18n.js
const vm = require('vm');
const existingCode = fs.readFileSync('js/i18n.js', 'utf8');
const sandbox = { window: {}, localStorage: { getItem: () => null, setItem: () => {} }, document: { documentElement: {} } };
vm.createContext(sandbox);
vm.runInContext(existingCode, sandbox);
const existingI18N = sandbox.window.PoliI18n.I18N;

const es = {};
const nl = {};
const pt = {};
for (const k of Object.keys(en)) {
  es[k] = sanitize(existingI18N.es[k] || '');
  nl[k] = sanitize(existingI18N.nl[k] || '');
  pt[k] = sanitize(existingI18N.pt[k] || '');
}

// French dictionary
const fr = {
  "app.title": "Calculateur de risque de migration et rejet de piercing | Poli International",
  "app.badge": "Guide clinique et d'atelier V2",
  "app.heading": "Risque de migration et de rejet de piercing",
  "app.subheading": "Évaluez les facteurs anatomiques, mécaniques et liés aux bijoux qui influencent la migration et le rejet. Identifiez les signaux d'alerte précoces, enregistrez des mesures répétées dans le temps et sachez quand consulter votre perceur.",
  "app.langSelectAria": "Sélecteur de langue",
  "app.langLabel": "Langue",
  "app.printBtn": "Imprimer le guide des signes et des preuves",
  "app.disclaimerTitle": "Avis clinique important :",
  "app.disclaimerBody": "Cet outil fournit une analyse et un suivi pédagogiques des facteurs de risque basés sur la pratique professionnelle établie. Il ne peut pas diagnostiquer une infection active, un rejet ou une lésion tissulaire structurelle. Si vous observez un bijou qui s'enfonce dans des tissus gonflés, un amincissement progressif de la peau, de la fièvre, une chaleur extrême ou une douleur intense, consultez immédiatement un perceur corporel professionnel ou un médecin. Ne tentez jamais de retirer vous-même un piercing en cours de migration active ou incrusté.",
  "embedding.tag": "Urgence aiguë",
  "embedding.title": "L'incrustation du bijou est urgente et différente de la migration",
  "embedding.desc": "Un bijou trop court pour le gonflement et qui s'enfonce dans la chair constitue une urgence aiguë : il ne s'agit pas d'une migration lente. Si les embouts décoratifs ou les disques sont avalés par le tissu, le corps ne peut pas cicatriser et les tissus peuvent recouvrir le bijou en quelques jours.",
  "embedding.sign1": "Bille décorative, disque ou gemme s'enfonçant profondément dans la peau ou affleurant avec le tissu tuméfié",
  "embedding.sign2": "Douleur pulsatile intense, chaleur localisée ou impossibilité de voir la tige du barbell",
  "embedding.sign3": "Tissu formant un bourrelet tuméfié ou commençant à proliférer sur les bords du bijou",
  "embedding.action": "Consultez immédiatement votre perceur pour poser une barre plus longue adaptée au gonflement. N'attendez pas plusieurs semaines pour observer cela.",
  "nav.tracker": "Journal de mesures",
  "nav.signs": "Signes illustrés",
  "nav.placements": "Par emplacement",
  "nav.actions": "Ce que fait le perceur",
  "factors.heading": "Évaluation des facteurs de risque",
  "factors.subheading": "Sélectionnez l'option correspondant le mieux à votre piercing dans chacune des 6 catégories ci-dessous.",
  "factors.placement.legend": "1. Emplacement du piercing et architecture tissulaire",
  "factors.placement.opt_fold": "Pli tissulaire naturel (lobe d'oreille, pli de cartilage/hélix, septum, lèvre) : deux parois tissulaires opposées avec tension perpendiculaire équilibrée",
  "factors.placement.opt_navel": "Anatomie de surface courbe (nombril ou arcade sourcilière) : soumise aux mouvements constants du visage ou du torse et aux frottements des vêtements",
  "factors.placement.opt_surface": "Surface plane ou ancrage en un seul point (barre de surface ou microdermal sur le thorax, la clavicule, la nuque, le poignet) : tissu plan sous tension latérale continue de la peau",
  "factors.fit.legend": "2. Longueur et ajustement du bijou",
  "factors.fit.opt_downsized": "Tige correctement ajustée (raccourcie par un perceur une fois l'œdème initial résorbé)",
  "factors.fit.opt_long": "Tige initiale excessivement longue (le gonflement s'est résorbé mais la tige n'a jamais été raccourcie ; elle s'accroche et fait levier sur le canal)",
  "factors.fit.opt_tight": "Tige excessivement courte ou comprimante (s'enfonçant dans les tissus sans aucun espace libre pour le drainage normal des fluides)",
  "factors.material.legend": "3. Matériau du bijou et biocompatibilité",
  "factors.material.opt_implant": "Matériau certifié de qualité implantaire (titane ASTM F-136, copolymère PP-R médical de bijoux de corps BioFlex®, acier pour implants ASTM F-138, niobium)",
  "factors.material.opt_mystery": "Métal plaqué, alliage fantaisie inconnu, acrylique, argent sterling ou acier non implantaire d'origine inconnue",
  "factors.trauma.legend": "4. Frottements, accrochages et pression",
  "factors.trauma.opt_none": "Bien protégé : aucune pression directe pendant le sommeil, préservé des vêtements serrés, zéro choc sportif",
  "factors.trauma.opt_occasional": "Accrochages mineurs occasionnels (contact léger avec les vêtements ou manipulation accidentelle rare)",
  "factors.trauma.opt_frequent": "Frottements ou pressions fréquents (dormir directement sur le piercing, ceintures hautes, frictions athlétiques répétitives)",
  "factors.aftercare.legend": "5. Routine de soins et manipulation",
  "factors.aftercare.opt_saline": "Vaporisation de sérum physiologique stérile à 0,9 % deux fois par jour, ou principe LITHA (ne pas toucher), séchage délicat par tamponnement avec du papier jetable propre",
  "factors.aftercare.opt_inconsistent": "Routine irrégulière : cotons-tiges occasionnels, manipulation avec les mains non lavées ou application discontinue de sérum physiologique",
  "factors.aftercare.opt_harsh": "Produits chimiques agressifs ou pommades : alcool à friction, eau oxygénée, huile d'arbre à thé, savon antibactérien ou crèmes épaisses",
  "factors.history.legend": "6. Historique de cicatrisation et état des tissus",
  "factors.history.opt_healthy": "Historique de cicatrisation favorable : les piercings précédents ont cicatrisé dans les délais sans irritation persistante ni migration",
  "factors.history.opt_slow": "Cicatrisation lente ou difficile : rougeurs prolongées, écoulements de lymphe ou excroissances d'irritation récurrentes sur les piercings antérieurs",
  "factors.history.opt_scar": "Rejet antérieur ou cicatrisation proéminente : un piercing précédent a migré vers l'extérieur ou produit un tissu cicatriciel épais en relief",
  "factors.btnEvaluate": "Évaluer les facteurs de risque",
  "factors.btnClear": "Effacer toutes les sélections",
  "factors.errIncomplete": "Veuillez sélectionner une option pour chacune des 6 catégories de facteurs afin de générer l'évaluation clinique.",
  "results.title": "Résultats de l'évaluation des facteurs",
  "results.tendencyLower": "Tendance générale : plus faible probabilité de migration",
  "results.descLower": "Votre piercing présente de solides facteurs anatomiques et de bijouterie favorisant la stabilité. Maintenez des soins doux et réguliers et surveillez vos mesures régulièrement.",
  "results.tendencyModerate": "Tendance générale : risque modéré / mixte",
  "results.descModerate": "Votre piercing associe des éléments stabilisateurs et des facteurs d'irritation potentiels. L'application des mesures concrètes ci-dessous vous aidera à protéger votre canal.",
  "results.tendencyHigher": "Tendance générale : plus forte probabilité de migration / rejet",
  "results.descHigher": "Plusieurs forces anatomiques ou mécaniques majeures s'exercent contre ce canal de piercing. Une consultation rapide auprès d'un perceur professionnel est fortement recommandée pour éviter une perte tissulaire définitive.",
  "results.raisingTitle": "Facteurs qui augmentent le risque",
  "results.protectiveTitle": "Facteurs protecteurs / stabilisateurs",
  "results.noRaising": "Aucun facteur de risque majeur identifié selon vos sélections.",
  "results.noProtective": "Aucun facteur de protection marqué n'a été sélectionné.",
  "results.actionsTitle": "Ce que vous pouvez changer (mesures concrètes)",
  "results.actDownsize": "Prenez rendez-vous avec votre perceur pour raccourcir votre bijou (downsize) dès que le gonflement initial s'est complètement résorbé.",
  "results.actTight": "Consultez un perceur sans délai pour installer une tige offrant un dégagement suffisant afin d'éviter l'incrustation tissulaire.",
  "results.actMaterial": "Remplacez les alliages non vérifiés par des matériaux biocompatibles certifiés pour implants : titane ASTM F-136 ou copolymère PP-R médical de bijoux de corps BioFlex®.",
  "results.actPressure": "Éliminez la pression directe : utilisez un coussin de voyage percé pour dormir sur le côté ou évitez les ceintures rigides appuyant sur la zone.",
  "results.actHarsh": "Arrêtez immédiatement tous les produits agressifs (alcool, eau oxygénée, arbre à thé). Nettoyez uniquement avec un spray salin stérile à 0,9 %.",
  "results.actInconsistent": "Adoptez une routine rigoureuse : vaporisez du sérum physiologique stérile deux fois par jour et évitez strictement toute rotation ou manipulation du bijou.",
  "tracker.heading": "Journal de mesures répétables : preuve objective",
  "tracker.subheading": "La migration est un processus lent. Mesurer la même distance tous les 14 à 30 jours fournit des preuves concrètes avant que des lésions cutanées visibles ne surviennent.",
  "tracker.methodLabel": "Méthode de mesure :",
  "tracker.methodBridge": "Pont tissulaire : distance de trou à trou / bord du tissu (mm)",
  "tracker.methodBar": "Barre visible : longueur de barre exposée entre la peau et les billes (mm)",
  "tracker.dateLabel": "Date de la mesure :",
  "tracker.valueLabel": "Mesure (mm) :",
  "tracker.valuePlaceholder": "ex. 8,5",
  "tracker.factorsHeading": "Qu'est-ce qui a changé depuis la dernière fois ? (Cochez tout ce qui s'applique) :",
  "tracker.factorJewellery": "Changement de bijou (taille ou matière)",
  "tracker.factorSnag": "Accrochage ou traction accidentelle",
  "tracker.factorSleep": "Pression de sommeil sur la zone",
  "tracker.factorProducts": "Changement de produit de soin",
  "tracker.factorSick": "Épisode de maladie ou stress immunitaire",
  "tracker.notesLabel": "Remarques (facultatif) :",
  "tracker.notesPlaceholder": "ex. Gonflement résorbé, bijou raccourci de 2 mm chez le perceur",
  "tracker.btnSave": "Enregistrer la mesure",
  "tracker.btnClearAll": "Effacer l'historique des mesures",
  "tracker.errValid": "Veuillez entrer une valeur de mesure numérique valide en millimètres (entre 1 et 50 mm).",
  "tracker.errDate": "Veuillez sélectionner une date de mesure valide.",
  "tracker.trendStable": "Mesures stables. Aucune réduction détectable du pont tissulaire observée sur cette période.",
  "tracker.trendShallow": "Alerte : Le pont de tissu cutané a diminué de {diff} mm ({pct}% de réduction). Cette réduction indique une migration active. Prenez rendez-vous avec votre perceur.",
  "tracker.trendBarGrowing": "Alerte : La tige visible a augmenté de {diff} mm. Si ce changement ne découle pas d'une résorption normale d'œdème précoce, cela suggère une migration tissulaire. Consultez votre perceur.",
  "tracker.trendInsufficient": "Au moins deux enregistrements de mesures sont requis pour établir une tendance objective dans le temps.",
  "tracker.colDate": "Date",
  "tracker.colMethod": "Méthode",
  "tracker.colValue": "Mesure",
  "tracker.colChange": "Évolution",
  "tracker.colFactors": "Facteurs signalés",
  "tracker.colNotes": "Remarques",
  "tracker.colActions": "Actions",
  "tracker.btnDelete": "Supprimer",
  "tracker.empty": "Aucune mesure enregistrée pour le moment. Renseignez votre première valeur ci-dessus pour amorcer votre suivi objectif.",
  "signs.heading": "Signes de migration, illustrés",
  "signs.subheading": "Comparez un canal stabilisé en profondeur avec les caractéristiques visuelles d'un bijou en cours de rejet.",
  "signs.toggleNormal": "Normal / Installé",
  "signs.toggleMigrating": "En migration / Superficiel",
  "signs.sign1.title": "1. Amincissement de la peau sur la barre",
  "signs.sign1.desc": "La bande de tissu recouvrant la tige devient translucide, brillante ou nettement plus fine que lors du perçage.",
  "signs.sign1.action": "Consultez un perceur professionnel pour évaluer l'épaisseur restante avant que la peau ne se déchire.",
  "signs.sign2.title": "2. Barre visible à travers la peau",
  "signs.sign2.desc": "La teinte métallique foncée ou la silhouette géométrique de la barre devient visible sous la surface épidermique.",
  "signs.sign2.action": "Prenez rendez-vous avec votre perceur : lorsque la tige est visible à travers la peau, le retrait est généralement inévitable.",
  "signs.sign3.title": "3. Rapprochement des orifices d'entrée et de sortie",
  "signs.sign3.desc": "La distance totale entre les deux orifices rétrécit au fil des semaines, exposant une longueur accrue de tige métallique.",
  "signs.sign3.action": "Comparez avec vos mesures initiales et montrez vos relevés à un perceur qualifié.",
  "signs.sign4.title": "4. Rougeur et irritation qui persistent",
  "signs.sign4.desc": "Une rougeur persistante et squameuse le long du trajet tissulaire ne cédant pas après plusieurs mois de soins appropriés.",
  "signs.sign4.action": "Faites vérifier la matière et l'angle du bijou par un perceur pour distinguer une simple irritation d'un rejet actif.",
  "surface.heading": "Piercings de surface et sur plan plat expliqués",
  "surface.lead": "Pourquoi les piercings sur surfaces planes se comportent différemment des piercings traversant un pli tissulaire anatomique.",
  "surface.p1": "Les piercings traditionnels traversent un pli de tissu souple (comme le lobe de l'oreille, l'aile du nez ou le septum). Dans un pli, deux couches de tissu reposent naturellement l'une contre l'autre, et la tension s'exerce de façon perpendiculaire et équilibrée de part et d'autre du canal.",
  "surface.p2": "Sur une surface plane (comme le sternum, la clavicule, la nuque ou le poignet), la peau est soumise à une tension latérale permanente due aux mouvements musculaires, à l'étirement épidermique et au frottement des vêtements. Il n'existe aucun pli anatomique pour accueillir la tige. La réponse immunitaire et cicatricielle considère naturellement un corps étranger rigide sous une peau plate comme un intrus à expulser vers la surface : la voie de moindre résistance.",
  "surface.p3": "C'est pourquoi les piercings de surface requièrent des barres de surface spécifiques pliées à angle droit à 90 degrés ou des ancrages microdermaux, et non de simples barbells droits ou courbés. Même exécutés avec une technique rigoureuse, les piercings de surface présentent une durée de vie moyenne plus limitée et doivent être suivis avec une vigilance méthodique.",
  "placements.heading": "Conseils par emplacement",
  "placements.tabNavel": "Piercing au nombril",
  "placements.tabEyebrow": "Piercing à l'arcade",
  "placements.tabSurface": "Barre de surface",
  "placements.tabDermal": "Ancrage microdermal",
  "placements.navel.p1": "Le piercing du nombril nécessite un repli cutané supérieur bien défini qui s'enroule confortablement autour de la bille supérieure lorsque la personne est assise. Les personnes dont le nombril s'aplatit ou s'affaisse en position assise subissent une forte pression ascendante sur la bille inférieure, ce qui repousse inexorablement le bijou vers l'avant.",
  "placements.navel.p2": "Signes d'alerte : La bille supérieure penche vers l'avant, la tige devient visible sous la peau entre les orifices, ou la bande de tissu cutané rétrécit à moins de 8 mm.",
  "placements.eyebrow.p1": "Les piercings à l'arcade traversent une zone osseuse proéminente très mobile avec un tissu sous-cutané minimal. L'expression faciale permanente (clignement, froncement) et les démaquillages créent des micro-traumatismes répétés sur le canal.",
  "placements.eyebrow.p2": "Signes d'alerte : La tige dépasse de plus en plus alors que le gonflement s'est déjà résorbé, ou la peau commence à briller et à blanchir sur la barre.",
  "placements.surface.p1": "Les barres de surface plates (barbell à 90 degrés) reposent dans le derme superficiel. Le canal doit être préparé exactement à la bonne profondeur afin que les pieds à 90 degrés émergent perpendiculairement sans exercer de traction vers le haut.",
  "placements.surface.p2": "Signes d'alerte : Les embouts commencent à basculer sur le côté, la barre transversale devient palpable sous la peau ou une rougeur chronique relie les deux extrémités.",
  "placements.dermal.p1": "Les ancrages microdermaux possèdent une embase perforée logée sous la peau où le tissu se développe à travers les ouvertures pour stabiliser la pièce. Ils ne comportent qu'un seul point de sortie.",
  "placements.dermal.p2": "Signes d'alerte : L'embase commence à s'incliner, la plaque émerge visiblement au-dessus du niveau de la peau, ou l'ancrage oscille lors d'une pression légère.",
  "actions.heading": "Ce qu'un perceur peut réellement faire",
  "actions.lead": "Il n'existe aucune pommade magique pour arrêter un rejet actif. Cependant, une intervention précoce par un perceur qualifié peut résoudre les causes sous-jacentes.",
  "actions.act1.title": "1. Raccourcir la barre (downsize)",
  "actions.act1.desc": "Si une tige initiale trop longue dépasse et s'accroche constamment, la remplacer par une barre ajustée à la bonne longueur supprime l'effet de levier mécanique et stabilise le canal.",
  "actions.act2.title": "2. Changer de style de bijou, d'embouts ou de matériau",
  "actions.act2.desc": "Remplacer des disques volumineux ou griffés par des embouts plats à profil bas réduit considérablement les accrochages. Passer d'un métal suspect à du titane ASTM F-136 ou à du copolymère PP-R médical de bijoux de corps BioFlex® élimine l'irritation immunologique.",
  "actions.act3.title": "3. Retirer et repositionner (repercer ultérieurement)",
  "actions.act3.desc": "Retirer le bijou de façon préventive pendant que les tissus sont encore intacts permet au canal de se refermer proprement en laissant une cicatrice minime. Une fois la zone régénérée (3 à 6 mois), le perçage peut être refait selon un angle optimal.",
  "actions.act4.title": "4. La réalité objective : un piercing en rejet actif doit généralement être retiré",
  "actions.act4.desc": "Une fois que le corps a commencé à expulser activement un bijou de surface et que la peau s'est considérablement amincie, aucun protocole de soin ne peut inverser le processus. Tenter de le conserver entraîne une cicatrice fendue permanente et une perte de tissu cutané.",
  "rejection.title": "Après le rejet d'un piercing",
  "rejection.body": "Si votre piercing a migré ou a été retiré en urgence, laissez le tissu cutané cicatriser en douceur sans appliquer de substances abrasives. Pour évaluer la différence entre un tissu cicatriciel surélevé et une véritable cicatrice chéloïde, consultez notre",
  "rejection.linkText": "Guide et outil d'évaluation des chéloïdes de piercing",
  "print.sheetTitle": "Fiche des signes et mesures de migration de piercing",
  "print.sheetSubtitle": "Outil clinique et d'atelier Poli International : Fiche de suivi et d'historique",
  "print.clientEntryNote": "Conservez cette fiche avec les dates de vos mesures millimétriques pour la présenter à votre perceur lors de votre prochaine visite de contrôle.",
  "factors.placement.title": "1. Emplacement du piercing et architecture tissulaire",
  "factors.fit.title": "2. Longueur et ajustement du bijou",
  "factors.material.title": "3. Matériau du bijou et biocompatibilité",
  "factors.trauma.title": "4. Frottements, accrochages et pression",
  "factors.aftercare.title": "5. Routine de soins et manipulation",
  "factors.history.title": "6. Historique de cicatrisation et état des tissus"
};

// German dictionary
const de = {
  "app.title": "Piercing-Migrations- und Abstoßungsrisiko-Rechner | Poli International",
  "app.badge": "Klinischer Leitfaden und Studio-Guide V2",
  "app.heading": "Risiko von Piercing-Migration und Abstoßung",
  "app.subheading": "Bewerten Sie anatomische, mechanische und schmuckbezogene Faktoren, die eine Migration oder Abstoßung beeinflussen. Erkennen Sie Warnsignale frühzeitig, dokumentieren Sie wiederholbare Messungen und wissen Sie, wann der Gang zum Piercer nötig ist.",
  "app.langSelectAria": "Sprachauswahl",
  "app.langLabel": "Sprache",
  "app.printBtn": "Anzeichen- und Nachweisbogen drucken",
  "app.disclaimerTitle": "Wichtiger klinischer Hinweis:",
  "app.disclaimerBody": "Dieses Tool dient der sachlichen Information und Verlaufskontrolle auf Basis etablierter fachlicher Praxis. Es kann keine akute Infektion, Abstoßung oder strukturelle Gewebeschädigung diagnostizieren. Sollten Sie beobachten, dass Schmuck in geschwollenes Gewebe einwächst, die Haut dünner wird, Fieber, starke Hitze oder erhebliche Schmerzen auftreten, suchen Sie unverzüglich einen professionellen Piercer oder Arzt auf. Versuchen Sie niemals, ein wanderndes oder eingewachsenes Piercing eigenständig zu entfernen.",
  "embedding.tag": "Akuter Notfall",
  "embedding.title": "Das Einwachsen von Schmuck ist ein Notfall und unterscheidet sich von einer Migration",
  "embedding.desc": "Schmuck, der für die Schwellung zu kurz ist und im Gewebe versinkt, ist ein akuter Notfall: keine langsame Migration. Werden Schmuckenden oder Aufsätze vom Gewebe umschlossen, kann die Wunde nicht heilen und die Haut kann den Schmuck binnen weniger Tage vollständig überwuchern.",
  "embedding.sign1": "Schmuckkugel, Scheibe oder Aufsatz drückt tief in die Haut oder schließt bündig mit der Schwellung ab",
  "embedding.sign2": "Starker pochender Schmerz, lokale Überwärmung oder der Stab ist überhaupt nicht mehr sichtbar",
  "embedding.sign3": "Das Gewebe bildet einen wulstigen Kragen und beginnt über die Schmuckränder zu wachsen",
  "embedding.action": "Gehen Sie sofort zu Ihrem Piercer, um einen längeren Stab einsetzen zu lassen. Warten Sie hierbei keine Wochen ab.",
  "nav.tracker": "Messprotokoll",
  "nav.signs": "Bildliche Anzeichen",
  "nav.placements": "Nach Körperstelle",
  "nav.actions": "Was der Piercer tun kann",
  "factors.heading": "Erfassung der Risikofaktoren",
  "factors.subheading": "Wählen Sie in jeder der 6 folgenden Kategorien die Option, die am besten zu Ihrem Piercing passt.",
  "factors.placement.legend": "1. Platzierung des Piercings und Gewebearchitektur",
  "factors.placement.opt_fold": "Natürliche Gewebefalte (Ohrläppchen, Knorpelfalte/Helix, Septum, Lippe): zwei gegenüberliegende Gewebewände mit ausgeglichenem senkrechtem Zug",
  "factors.placement.opt_navel": "Gewölbte Oberflächenanatomie (Bauchnabel oder Augenbraue): ständiger Bewegung von Gesicht oder Rumpf sowie Kleidungskontakt ausgesetzt",
  "factors.placement.opt_surface": "Flache Hautoberfläche oder Einzelpunkt-Anker (Surface Barbell oder Dermal Anchor auf Brust, Schlüsselbein, Nacken, Handgelenk): flaches Gewebe unter ständiger seitlicher Hautspannung",
  "factors.fit.legend": "2. Schmucklänge und Passform",
  "factors.fit.opt_downsized": "Passgenauer Schmuckstab (nach Abklingen der Erstschwellung vom Piercer fachgerecht gekürzt)",
  "factors.fit.opt_long": "Übermäßig langer Erstschmuckstab (Schwellung ist abgeklungen, Stab wurde nie gekürzt; bleibt hängen und hebelt im Stichkanal)",
  "factors.fit.opt_tight": "Zu kurzer oder einschnürender Stab (drückt tief ins Gewebe ein, ohne Raum für natürlichen Wundsekretabfluss)",
  "factors.material.legend": "3. Schmuckmaterial und Biokompatibilität",
  "factors.material.opt_implant": "Zertifiziertes Implantatmaterial (ASTM F-136 Titan, BioFlex® body jewelry medizinisches PP-R-Copolymer, ASTM F-138 Implantatstahl, Niob)",
  "factors.material.opt_mystery": "Beschichtetes Modemetall, unbekannte Modeschmucklegierung, Acryl, Sterlingsilber oder herkömmlicher Industriestahl",
  "factors.trauma.legend": "4. Reibung, Hängenbleiben und Druck",
  "factors.trauma.opt_none": "Gut geschützt: kein Schlafdruck, vor enger Kleidung geschützt, keine Stoßbelastungen beim Sport",
  "factors.trauma.opt_occasional": "Gelegentliches leichtes Hängenbleiben (leichter Kleidungskontakt oder seltene unbedachte Berührungen)",
  "factors.trauma.opt_frequent": "Häufige Reibung oder Belastung (direktes Schlafen auf dem Piercing, enge Bünde, wiederholte sportliche Reibung)",
  "factors.aftercare.legend": "5. Pflegeroutine und Berührung",
  "factors.aftercare.opt_saline": "Sterile 0,9 %ige Kochsalzlösung zweimal täglich oder LITHA-Prinzip (nicht berühren), vorsichtiges Trockentupfen mit Einmaltüchern",
  "factors.aftercare.opt_inconsistent": "Unregelmäßige Pflege: gelegentliche Wattestäbchen, Anfassen mit ungewaschenen Händen oder unbeständige Anwendung von Salzlösung",
  "factors.aftercare.opt_harsh": "Aggressive Mittel oder Salben: Wundalkohol, Wasserstoffperoxid, Teebaumöl, antibakterielle Seifen oder dicke Pasten",
  "factors.history.legend": "6. Wundheilungsverlauf und Gewebezustand",
  "factors.history.opt_healthy": "Unauffällige Wundheilung: frühere Piercings heilten termingerecht ohne dauerhafte Reizungen oder Migration ab",
  "factors.history.opt_slow": "Verlangsamte oder mühsame Heilung: anhaltende Rötungen, verlängerte Sekretion oder wiederkehrende Reizbläschen bei früheren Piercings",
  "factors.history.opt_scar": "Frühere Piercingabstoßung oder ausgeprägte Narben: ein früheres Piercing wanderte heraus oder bildete erhabenes Narbengewebe",
  "factors.btnEvaluate": "Risikofaktoren auswerten",
  "factors.btnClear": "Alle Auswahlen zurücksetzen",
  "factors.errIncomplete": "Bitte treffen Sie in allen 6 Kategorien eine Auswahl, um die Auswertung zu berechnen.",
  "results.title": "Ergebnisse der Faktorenanalyse",
  "results.tendencyLower": "Gesamttendenz: Geringere Wahrscheinlichkeit einer Migration",
  "results.descLower": "Ihr Piercing weist solide anatomische und schmuckbezogene Faktoren auf, die eine stabile Einheilung begünstigen. Behalten Sie die sanfte Pflege bei und kontrollieren Sie Ihre Abstände in regelmäßigen Abständen.",
  "results.tendencyModerate": "Gesamttendenz: Mäßiges / gemischtes Risiko",
  "results.descModerate": "Ihr Piercing vereint stabilisierende Aspekte mit potenziellen Reizquellen. Die folgenden Maßnahmen können dazu beitragen, den Stichkanal zu entlasten.",
  "results.tendencyHigher": "Gesamttendenz: Höhere Wahrscheinlichkeit einer Migration / Abstoßung",
  "results.descHigher": "Gegen diesen Stichkanal wirken mehrere anatomische oder mechanische Belastungsfaktoren. Eine zeitnahe Begutachtung durch einen professionellen Piercer wird dringend empfohlen, um dauerhaften Gewebeverlust zu verhindern.",
  "results.raisingTitle": "Faktoren, die das Risiko erhöhen",
  "results.protectiveTitle": "Stabilisierende / schützende Faktoren",
  "results.noRaising": "Aufgrund Ihrer Angaben wurden keine akuten Risikotreiber festgestellt.",
  "results.noProtective": "Es wurden keine ausgeprägten Schutzfaktoren ausgewählt.",
  "results.actionsTitle": "Was Sie verändern können (praktische Maßnahmen)",
  "results.actDownsize": "Vereinbaren Sie einen Termin zum Downsizing bei Ihrem Piercer, sobald die Schwellung abgeklungen ist.",
  "results.actTight": "Gehen Sie umgehend zu einem Piercer, um einen Stab mit ausreichendem Spielraum einsetzen zu lassen und Einwachsen vorzubeugen.",
  "results.actMaterial": "Tauschen Sie unbekannte Legierungen gegen biokompatibles Implantatmaterial: ASTM F-136 Titan oder BioFlex® body jewelry medizinisches PP-R-Copolymer.",
  "results.actPressure": "Beseitigen Sie direkten Druck: Verwenden Sie ein Piercingkissen mit Aussparung zum Schlafen oder meiden Sie Druck durch Kleidung.",
  "results.actHarsh": "Stellen Sie aggressive Mittel sofort ein (kein Alkohol, kein Wasserstoffperoxid, kein Teebaumöl). Nutzen Sie ausschließlich sterile Kochsalzlösung.",
  "results.actInconsistent": "Halten Sie eine verlässliche Pflegeroutine ein: zweimal täglich Salzlösung aufsprühen und jede unnötige Bewegung oder Drehung des Schmucks unterlassen.",
  "tracker.heading": "Wiederholbares Messprotokoll: objektive Nachweise",
  "tracker.subheading": "Migration verläuft schleichend. Eine wiederholte Messung derselben Distanz alle 14 bis 30 Tage liefert eindeutige Nachweise, bevor sichtbare Schäden entstehen.",
  "tracker.methodLabel": "Messmethode:",
  "tracker.methodBridge": "Gewebesteg: Abstand von Einstich zu Einstich / Gewebekante (mm)",
  "tracker.methodBar": "Sichtbarer Stab: Länge des sichtbaren Stabes zwischen Haut und Kugeln (mm)",
  "tracker.dateLabel": "Datum der Messung:",
  "tracker.valueLabel": "Messung (mm):",
  "tracker.valuePlaceholder": "z. B. 8,5",
  "tracker.factorsHeading": "Was hat sich seit dem letzten Mal geändert? (Alles Zutreffende auswählen):",
  "tracker.factorJewellery": "Schmuckwechsel (Größe oder Material)",
  "tracker.factorSnag": "Hängenbleiben oder Ruck am Piercing",
  "tracker.factorSleep": "Schlafdruck auf der Piercingstelle",
  "tracker.factorProducts": "Wechsel des Pflegemittels",
  "tracker.factorSick": "Krankheit oder geschwächtes Immunsystem",
  "tracker.notesLabel": "Notizen (optional):",
  "tracker.notesPlaceholder": "z. B. Schwellung zurückgegangen, Stab beim Piercer um 2 mm gekürzt",
  "tracker.btnSave": "Messung speichern",
  "tracker.btnClearAll": "Messverlauf löschen",
  "tracker.errValid": "Bitte geben Sie einen gültigen numerischen Messwert in Millimetern ein (zwischen 1 und 50 mm).",
  "tracker.errDate": "Bitte wählen Sie ein gültiges Datum für die Messung aus.",
  "tracker.trendStable": "Stabile Messwerte. Im Beobachtungszeitraum wurde keine Verringerung des Gewebestegs festgestellt.",
  "tracker.trendShallow": "Warnung: Der Gewebesteg hat sich um {diff} mm verringert ({pct} % Reduktion). Dies ist ein deutliches Anzeichen für eine fortschreitende Migration. Bitte Piercer aufsuchen.",
  "tracker.trendBarGrowing": "Warnung: Die sichtbare Stablänge hat um {diff} mm zugenommen. Ist dies kein normales Abklingen der Erstschwellung, spricht dies für eine Migration. Konsultieren Sie Ihren Piercer.",
  "tracker.trendInsufficient": "Es sind mindestens zwei Messungen erforderlich, um einen Trend im zeitlichen Verlauf darzustellen.",
  "tracker.colDate": "Datum",
  "tracker.colMethod": "Methode",
  "tracker.colValue": "Messwert",
  "tracker.colChange": "Veränderung",
  "tracker.colFactors": "Begleitfaktoren",
  "tracker.colNotes": "Notizen",
  "tracker.colActions": "Aktionen",
  "tracker.btnDelete": "Löschen",
  "tracker.empty": "Noch keine Messungen gespeichert. Tragen Sie Ihren ersten Wert oben ein, um die Verlaufskontrolle zu starten.",
  "signs.heading": "Migrationsanzeichen im Bild",
  "signs.subheading": "Vergleichen Sie einen tief eingeheilten Stichkanal mit den Merkmalen eines Schmuckstücks im Abstoßungsprozess.",
  "signs.toggleNormal": "Normal / Eingeheilt",
  "signs.toggleMigrating": "Wandernd / Oberflächlich",
  "signs.sign1.title": "1. Dünner werdende Haut über dem Stab",
  "signs.sign1.desc": "Die Hautbrücke über dem Schmuckstab wird glänzend, durchscheinend und spürbar dünner als zum Zeitpunkt des Stechens.",
  "signs.sign1.action": "Lassen Sie die Restgewebedicke von einem Piercer prüfen, bevor die Haut reißt.",
  "signs.sign2.title": "2. Durch die Haut schimmernder Stab",
  "signs.sign2.desc": "Der dunkle Metallschatten oder die klare Kontur des Stabes zeichnet sich deutlich unter der Hautoberfläche ab.",
  "signs.sign2.action": "Suchen Sie einen Piercer auf: Sobald der Stab durchschimmert, ist eine Entfernung meist unvermeidlich.",
  "signs.sign3.title": "3. Ein- und Austrittskanal wandern aufeinander zu",
  "signs.sign3.desc": "Der Gesamtabstand zwischen den beiden Einstichpunkten verringert sich im Laufe der Wochen zusehends, sodass mehr Stab freiliegt.",
  "signs.sign3.action": "Gleichen Sie dies mit Ihren Messdaten ab und zeigen Sie die Aufzeichnungen einem Fachbetrieb.",
  "signs.sign4.title": "4. Rötung und Reizung klingen nicht ab",
  "signs.sign4.desc": "Eine streifenförmige, schuppende Rötung entlang des Kanals bleibt auch nach Monaten korrekter Pflege bestehen.",
  "signs.sign4.action": "Lassen Sie Material und Winkel vom Piercer begutachten, um einfache Reizung von Abstoßung zu unterscheiden.",
  "surface.heading": "Oberflächenpiercings und Flachgewebe erklärt",
  "surface.lead": "Warum sich Piercings auf flachen Körperpartien grundlegend anders verhalten als Piercings durch natürliche Gewebefalten.",
  "surface.p1": "Klassische Piercings verlaufen durch eine geschmeidige Haut- oder Knorpelfalte (wie Ohrläppchen, Nasenflügel oder Septum). In einer Falte liegen zwei Gewebeschichten aneinander an, und die Zugkräfte verteilen sich symmetrisch und senkrecht zum Kanal.",
  "surface.p2": "Auf flachen Hautstellen (wie Brustbein, Schlüsselbein, Nacken oder Handgelenk) steht die Haut unter ständiger seitlicher Spannung durch Muskelarbeit, Dehnung und Kleiderreibung. Es gibt keine Gewebefalte, die den Schmuck einbettet. Die körpereigene Abwehr betrachtet einen starren Fremdkörper im Flachgewebe naturgemäß als Eindringling, der zur Hautoberfläche hin ausgestoßen werden soll: dem Weg des geringsten Widerstands.",
  "surface.p3": "Aus diesem Grund erfordern Oberflächenpiercings spezielle 90-Grad-Surface-Barbells oder Dermal Anchors anstelle einfacher gerader oder gebogener Stäbe. Selbst bei optimaler Platzierung haben sie eine begrenzte Verweildauer und verlangen regelmäßige Kontrolle.",
  "placements.heading": "Hinweise nach Platzierungsbereich",
  "placements.tabNavel": "Bauchnabelpiercing",
  "placements.tabEyebrow": "Augenbrauenpiercing",
  "placements.tabSurface": "Surface Barbell",
  "placements.tabDermal": "Dermal Anchor",
  "placements.navel.p1": "Ein Bauchnabelpiercing benötigt eine ausgeprägte obere Hautfalte, die die obere Kugel im Sitzen umschließt. Flacht der Nabel im Sitzen ab oder faltet sich zusammen, entsteht massiver Druck von unten gegen die untere Kugel, der den Schmuck nach außen hebelt.",
  "placements.navel.p2": "Warnzeichen: Die obere Kugel neigt sich nach vorn, der Stab wird im Kanal sichtbar oder die Hautbrücke schrumpft auf unter 8 mm zusammen.",
  "placements.eyebrow.p1": "Augenbrauenpiercings sitzen auf einem exponierten Knochenbogen mit dünnem Unterhautgewebe. Ständige Mimik sowie Hängenbleiben beim Anziehen oder Abschminken belasten das Gewebe kontinuierlich.",
  "placements.eyebrow.p2": "Warnzeichen: Der Stab ragt nach Abklingen der Schwellung immer weiter heraus, oder die Haut über dem Stab spannt und verfärbt sich weißlich.",
  "placements.surface.p1": "Flache Oberflächenstäbe (90-Grad-Barbells) liegen in der mittleren Hautschicht. Der Kanal muss exakt in der richtigen Tiefe liegen, damit die Enden senkrecht herausragen, ohne Zug nach oben auszuüben.",
  "placements.surface.p2": "Warnzeichen: Die Aufsätze beginnen zu kippen, die Querstange ist als Wulst tastbar oder es bildet sich eine dauerhafte Rötung zwischen den Punkten.",
  "placements.dermal.p1": "Dermal Anchors besitzen eine perforierte Fußplatte unter der Haut, in die das Gewebe zur Verankerung hineinwächst. Sie besitzen nur einen einzigen Austrittspunkt.",
  "placements.dermal.p2": "Warnzeichen: Die Fußplatte kippt schräg, die Schmuckbasis hebt sich über das Hautniveau oder der Anker wackelt bei Berührung.",
  "actions.heading": "Was ein Piercer tatsächlich tun kann",
  "actions.lead": "Es gibt keine Salbe, die eine Abstoßung aufhalten kann. Doch fachkundiges Eingreifen kann die Ursachen beheben.",
  "actions.act1.title": "1. Schmuck auf einen kürzeren Stab wechseln (Downsizing)",
  "actions.act1.desc": "Steht ein überlanger Erstschmuckstab heraus und verfängt sich ständig, nimmt ein passgenauer kurzer Stab die Hebelwirkung aus dem Kanal.",
  "actions.act2.title": "2. Schmuckmodell, Aufsätze oder Material anpassen",
  "actions.act2.desc": "Große oder scharfkantige Aufsätze durch flache Plättchen zu ersetzen, verringert Hängenbleiben. Der Wechsel von Modemetall zu ASTM F-136 Titan oder BioFlex® body jewelry medizinischem PP-R-Copolymer beseitigt Reizungen.",
  "actions.act3.title": "3. Schmuck entfernen und später neu stechen",
  "actions.act3.desc": "Ein rechtzeitiges Entfernen bei intakter Haut lässt den Kanal mit minimaler Narbe schließen. Nach 3 bis 6 Monaten kann an günstigerer Stelle neu gepierct werden.",
  "actions.act4.title": "4. Die ehrliche Realität: Ein aktiv abstoßendes Piercing muss meist entfernt werden",
  "actions.act4.desc": "Hat der Körper begonnen, einen Schmuck aktiv abzustoßen und ist die Haut stark verdünnt, lässt sich dies nicht rückgängig machen. Ein zu langes Zuwarten führt zu gespaltenen Narben.",
  "rejection.title": "Nach einer Piercingabstoßung",
  "rejection.body": "Wenn ein Piercing abgestoßen oder entfernt wurde, lassen Sie das Areal in Ruhe abheilen. Um den Unterschied zwischen Narbengewebe und echten Keloiden zu verstehen, konsultieren Sie unseren",
  "rejection.linkText": "Leitfaden für Piercing-Keloide und Narbengewebe",
  "print.sheetTitle": "Erfassungsbogen für Migrationsanzeichen und Messwerte",
  "print.sheetSubtitle": "Poli International Studio-Tool: Dokumentations- und Verlaufsprotokoll",
  "print.clientEntryNote": "Bewahren Sie diesen Bogen mit Ihren Datums- und Millimeterangaben auf, um ihn beim nächsten Kontrolltermin Ihrem Piercer vorzulegen.",
  "factors.placement.title": "1. Platzierung des Piercings und Gewebearchitektur",
  "factors.fit.title": "2. Schmucklänge und Passform",
  "factors.material.title": "3. Schmuckmaterial und Biokompatibilität",
  "factors.trauma.title": "4. Reibung, Hängenbleiben und Druck",
  "factors.aftercare.title": "5. Pflegeroutine und Berührung",
  "factors.history.title": "6. Wundheilungsverlauf und Gewebezustand"
};

// Italian dictionary
const it = {
  "app.title": "Calcolatore del rischio di migrazione e rigetto del piercing | Poli International",
  "app.badge": "Guida clinica e per studi V2",
  "app.heading": "Rischio di migrazione e rigetto del piercing",
  "app.subheading": "Valuta i fattori anatomici, meccanici e legati ai gioielli che influenzano la migrazione e il rigetto. Riconosci tempestivamente i segnali d'allarme, registra misurazioni periodiche nel tempo e scopri quando consultare il tuo piercer.",
  "app.langSelectAria": "Selettore della lingua",
  "app.langLabel": "Lingua",
  "app.printBtn": "Stampa guida ai segni e alle misurazioni",
  "app.disclaimerTitle": "Avviso clinico importante:",
  "app.disclaimerBody": "Questo strumento offre un'analisi e un monitoraggio a scopo informativo basati sulla pratica professionale consolidata. Non è in grado di diagnosticare infezioni acute, rigetti in corso o lesioni tissutali strutturali. Se noti che il gioiello sta sprofondando nei tessuti gonfi, un progressivo assottigliamento della pelle, febbre, calore intenso o forte dolore, rivolgiti immediatamente a un piercer professionista o a un medico. Non tentare mai di rimuovere autonomamente un piercing inglobato o in fase attiva di migrazione.",
  "embedding.tag": "Emergenza acuta",
  "embedding.title": "L'inglobamento del gioiello è urgente e diverso dalla migrazione",
  "embedding.desc": "Un gioiello troppo corto rispetto al gonfiore che sprofonda nella carne costituisce un'emergenza acuta: non si tratta di una migrazione lenta. Se le sfere decorative o i dischi vengono inglobati dal tessuto, il corpo non può guarire e la pelle può ricoprire il gioiello nel giro di pochi giorni.",
  "embedding.sign1": "Sfera decorativa, disco o gemma che preme a fondo nella pelle o si trova a livello del tessuto tumefatto",
  "embedding.sign2": "Forte dolore pulsante, calore localizzato o impossibilità totale di scorgere la barra",
  "embedding.sign3": "Tessuto che forma un cordone rigonfio e comincia a crescere sopra i bordi del gioiello",
  "embedding.action": "Recati subito dal tuo piercer per inserire una barra più lunga adatta al gonfiore. Non aspettare settimane prima di intervenire.",
  "nav.tracker": "Registro misurazioni",
  "nav.signs": "Segni illustrati",
  "nav.placements": "Per zona anatomica",
  "nav.actions": "Cosa può fare il piercer",
  "factors.heading": "Valutazione dei fattori di rischio",
  "factors.subheading": "Seleziona l'opzione che corrisponde meglio alla tua situazione in ciascuna delle 6 categorie sottostanti.",
  "factors.placement.legend": "1. Posizionamento del piercing e architettura dei tessuti",
  "factors.placement.opt_fold": "Piega tissutale naturale (lobo, piega della cartilagine/elice, setto, labbro): due pareti opposte con tensione perpendicolare bilanciata",
  "factors.placement.opt_navel": "Superficie anatomica curva (ombelico o sopracciglio): soggetta a movimenti continui di viso o tronco e all'attrito degli indumenti",
  "factors.placement.opt_surface": "Superficie piana o ancoraggio a punto singolo (surface bar o microdermal su sterno, clavicola, nuca, polso): tessuto piatto sottoposto a costante tensione cutanea laterale",
  "factors.fit.legend": "2. Lunghezza e vestibilità del gioiello",
  "factors.fit.opt_downsized": "Barra della misura corretta (accorciata da un piercer una volta risolto il gonfiore iniziale)",
  "factors.fit.opt_long": "Barra iniziale eccessivamente lunga (il gonfiore è sparito ma non è mai stato fatto il downsize: si impiglia e fa leva nel canale)",
  "factors.fit.opt_tight": "Barra eccessivamente corta o costrittiva (preme nei tessuti senza lasciare spazio per il normale drenaggio)",
  "factors.material.legend": "3. Materiale del gioiello e biocompatibilità",
  "factors.material.opt_implant": "Materiale certificato per impianti (titanio ASTM F-136, copolimero medico PP-R per gioielleria per il corpo BioFlex®, acciaio per impianti ASTM F-138, niobio)",
  "factors.material.opt_mystery": "Metallo placcato, leghe commerciali sconosciute, acrilico, argento o acciaio da bigiotteria privo di certificazione implantare",
  "factors.trauma.legend": "4. Attrito, sfregamenti e pressione",
  "factors.trauma.opt_none": "Ben protetto: nessuna pressione notturna, al riparo da vestiti aderenti, zero urti durante lo sport",
  "factors.trauma.opt_occasional": "Sfregamenti occasionali leggeri (contatto occasionale con abiti o tocchi involontari rari)",
  "factors.trauma.opt_frequent": "Attrito o pressione frequenti (dormire direttamente sul piercing, cinture a vita alta, sollecitazioni atletiche ripetitive)",
  "factors.aftercare.legend": "5. Routine di cura e manipolazione",
  "factors.aftercare.opt_saline": "Soluzione salina sterile allo 0,9% nebulizzata due volte al giorno o LITHA (non toccare), asciugatura tamponando con carta usa e getta pulita",
  "factors.aftercare.opt_inconsistent": "Cura discontinua: uso occasionale di cotton fioc, manipolazione con mani non lavate o applicazione irregolare della soluzione fisiologica",
  "factors.aftercare.opt_harsh": "Sostanze chimiche aggressive o unguenti: alcol etilico, acqua ossigenata, olio essenziale di melaleuca (tea tree), sapone disinfettante o paste dense",
  "factors.history.legend": "6. Storia di guarigione e stato dei tessuti",
  "factors.history.opt_healthy": "Guarigione regolare e sana: i piercing precedenti sono guariti nei tempi previsti senza irritazioni persistenti o migrazioni",
  "factors.history.opt_slow": "Guarigione lenta o complicata: rossori prolungati, secrezioni persistenti o frequenti bolle da irritazione nei precedenti piercing",
  "factors.history.opt_scar": "Rigetto pregresso o cicatrice evidente: un piercing passato è migrato verso l'esterno o ha formato tessuto cicatriziale ispessito",
  "factors.btnEvaluate": "Valuta i fattori di rischio",
  "factors.btnClear": "Cancella tutte le selezioni",
  "factors.errIncomplete": "Seleziona un'opzione per ciascuna delle 6 categorie per elaborare la valutazione clinica.",
  "results.title": "Risultati della valutazione dei fattori",
  "results.tendencyLower": "Tendenza generale: minore probabilità di migrazione",
  "results.descLower": "Il tuo piercing presenta solidi fattori anatomici e di gioielleria che favoriscono la stabilità. Mantieni una cura delicata e costante e monitora periodicamente le misure.",
  "results.tendencyModerate": "Tendenza generale: rischio moderato / misto",
  "results.descModerate": "Il tuo piercing mostra una combinazione di fattori protettivi e potenziali cause di irritazione. Seguire i passi pratici indicati sotto aiuterà a proteggere il canale.",
  "results.tendencyHigher": "Tendenza generale: maggiore probabilità di migrazione / rigetto",
  "results.descHigher": "Sul canale di questo piercing gravano diversi importanti fattori di stress meccanico o anatomico. Si consiglia vivamente una tempestiva visita da un piercer professionista per scongiurare danni permanenti ai tessuti.",
  "results.raisingTitle": "Fattori che aumentano il rischio",
  "results.protectiveTitle": "Fattori protettivi / stabilizzanti",
  "results.noRaising": "Nessun fattore di rischio significativo rilevato in base alle tue risposte.",
  "results.noProtective": "Nessun fattore protettivo rilevante selezionato.",
  "results.actionsTitle": "Cosa puoi modificare (azioni pratiche)",
  "results.actDownsize": "Prenota un controllo dal tuo piercer per accorciare la barra (downsize) non appena l'edema iniziale si è attenuato.",
  "results.actTight": "Fatti visitare subito da un piercer per inserire una barra con la luce necessaria a evitare l'inglobamento cutaneo.",
  "results.actMaterial": "Sostituisci i metalli non certificati con materiali biocompatibili per impianti: titanio ASTM F-136 o copolimero medico PP-R per gioielleria per il corpo BioFlex®.",
  "results.actPressure": "Elimina le pressioni dirette: utilizza un cuscino forato da viaggio per dormire di lato ed evita indumenti che stringono sul punto.",
  "results.actHarsh": "Sospendi immediatamente prodotti chimici aggressivi (niente alcol, niente acqua ossigenata, niente tea tree oil). Detergi unicamente con soluzione salina sterile.",
  "results.actInconsistent": "Attieniti a una routine scrupolosa: nebulizza soluzione fisiologica due volte al giorno ed evita qualsiasi torsione o sfregamento superfluo.",
  "tracker.heading": "Registro delle misurazioni periodiche: evidenza oggettiva",
  "tracker.subheading": "La migrazione è un fenomeno graduale. Misurare la stessa distanza ogni 14-30 giorni fornisce riscontri oggettivi prima che compaiano lesioni visibili.",
  "tracker.methodLabel": "Metodo di misurazione:",
  "tracker.methodBridge": "Ponte di tessuto: distanza da foro a foro / bordo del tessuto (mm)",
  "tracker.methodBar": "Barra visibile: lunghezza della barra esposta tra pelle e sfere (mm)",
  "tracker.dateLabel": "Data della misurazione:",
  "tracker.valueLabel": "Misurazione (mm):",
  "tracker.valuePlaceholder": "es. 8,5",
  "tracker.factorsHeading": "Cosa è cambiato dall'ultima volta? (Seleziona tutto ciò che si applica):",
  "tracker.factorJewellery": "Cambio del gioiello (misura o materiale)",
  "tracker.factorSnag": "Trazione o urto accidentale",
  "tracker.factorSleep": "Pressione durante il sonno",
  "tracker.factorProducts": "Variazione dei prodotti per la cura",
  "tracker.factorSick": "Malattia o difese immunitarie basse",
  "tracker.notesLabel": "Note (opzionale):",
  "tracker.notesPlaceholder": "es. Gonfioro sparito, barra accorciata di 2 mm dal piercer",
  "tracker.btnSave": "Salva misurazione",
  "tracker.btnClearAll": "Cancella cronologia misurazioni",
  "tracker.errValid": "Inserisci un valore numerico valido espresso in millimetri (compreso tra 1 e 50 mm).",
  "tracker.errDate": "Seleziona una data valida per la misurazione.",
  "tracker.trendStable": "Misure stabili. Nessuna diminuzione rilevabile del ponte di tessuto nel periodo considerato.",
  "tracker.trendShallow": "Attenzione: Il ponte di tessuto cutaneo si è ridotto di {diff} mm (riduzione del {pct}%). Questa diminuzione evidenzia una migrazione attiva. Rivolgiti al tuo piercer.",
  "tracker.trendBarGrowing": "Attenzione: La porzione visibile della barra è aumentata di {diff} mm. Se non si tratta del normale assorbimento dell'edema iniziale, è segno di migrazione. Consulta il tuo piercer.",
  "tracker.trendInsufficient": "Sono necessarie almeno due misurazioni registrate per tracciare un andamento nel tempo.",
  "tracker.colDate": "Data",
  "tracker.colMethod": "Metodo",
  "tracker.colValue": "Valore",
  "tracker.colChange": "Variazione",
  "tracker.colFactors": "Eventi associati",
  "tracker.colNotes": "Note",
  "tracker.colActions": "Azioni",
  "tracker.btnDelete": "Elimina",
  "tracker.empty": "Nessuna misurazione salvata finora. Registra il tuo primo dato qui sopra per avviare il monitoraggio periodico.",
  "signs.heading": "Segni di migrazione illustrati",
  "signs.subheading": "Confronta un canale stabile e profondo con i tratti visivi tipici di un gioiello in fase di espulsione.",
  "signs.toggleNormal": "Normale / Assestato",
  "signs.toggleMigrating": "In migrazione / Superficiale",
  "signs.sign1.title": "1. Assottigliamento della pelle sopra la barra",
  "signs.sign1.desc": "Il tessuto sopra la barra diventa lucido, trasparente e visibilmente più sottile rispetto a quando è stato eseguito il foro.",
  "signs.sign1.action": "Fai controllare lo spessore tissutale residuo da un piercer prima che la pelle si laceri.",
  "signs.sign2.title": "2. Barra visibile attraverso la pelle",
  "signs.sign2.desc": "L'ombra scura del metallo o il contorno netto della barra si intravedono chiaramente sotto lo strato superficiale dell'epidermide.",
  "signs.sign2.action": "Fatti visitare da un piercer: quando la barra traspare sotto la pelle, la rimozione è quasi sempre inevitabile.",
  "signs.sign3.title": "3. Fori di entrata e uscita che si avvicinano",
  "signs.sign3.desc": "La distanza tra i due fori si accorcia con il passare delle settimane, lasciando scoperta una porzione maggiore della barra.",
  "signs.sign3.action": "Confronta il dato con le tue prime misurazioni e mostra i rilievi a un piercer qualificato.",
  "signs.sign4.title": "4. Rossore e irritazione persistenti",
  "signs.sign4.desc": "Un rossore costante e desquamato lungo il tragitto cutaneo non accenna a diminuire neppure dopo mesi di cura accurata.",
  "signs.sign4.action": "Fai valutare materiale e inclinazione al piercer per distinguere una semplice irritazione da un rigetto reale.",
  "surface.heading": "Piercing surface e piatti spiegati",
  "surface.lead": "Perché i piercing eseguiti su superfici piane si comportano diversamente rispetto a quelli che attraversano una piega naturale.",
  "surface.p1": "I piercing tradizionali attraversano una piega anatomica morbida (come il lobo, la narice o il setto). All'interno di una piega, i due strati di tessuto poggiano naturalmente l'uno contro l'altro, e le tensioni risultano equilibrate e perpendicolari rispetto al canale.",
  "surface.p2": "Su superfici corporee piatte (come sterno, clavicola, nuca o polso), la cute è soggetta a continua trazione laterale a causa dei movimenti muscolari, dell'elasticità cutanea e dello strofinio degli abiti. Non esiste una piega naturale in grado di ospitare la barra. Il sistema immunitario tende a espellere un corpo estraneo rigido situato sotto la pelle piatta verso la superficie: la via di minor resistenza.",
  "surface.p3": "Per questa ragione i surface richiedono barre sagomate a 90 gradi o microdermal, non barre dritte o ricurve ordinarie. Anche con una tecnica impeccabile, hanno una durata fisiologicamente limitata e richiedono costante monitoraggio.",
  "placements.heading": "Guida per singola zona",
  "placements.tabNavel": "Piercing all'ombelico",
  "placements.tabEyebrow": "Piercing al sopracciglio",
  "placements.tabSurface": "Surface bar",
  "placements.tabDermal": "Microdermal",
  "placements.navel.p1": "Il piercing all'ombelico richiede una cresta cutanea superiore ben formata che accolga la sfera superiore quando ci si siede. Nelle persone il cui ombelico si appiattisce o collassa da seduti, si genera una forte spinta verso l'alto sulla sfera inferiore che comprime e spinge in fuori il gioiello.",
  "placements.navel.p2": "Segnali d'allarme: La sfera superiore si inclina in avanti, la barra traspare sotto la pelle o il ponte di tessuto scende sotto gli 8 mm.",
  "placements.eyebrow.p1": "I piercing al sopracciglio attraversano un'arcata ossea sporgente con tessuto sottocutaneo minimo. La mimica facciale continua e gli sfregamenti involontari durante la detersione creano microtraumi costanti.",
  "placements.eyebrow.p2": "Segnali d'allarme: La barra sporge sempre di più anche a gonfiore scomparso, o la pelle appare tesa e biancastra sopra la barra.",
  "placements.surface.p1": "Le surface bar sagomate (con piega a 90 gradi) alloggiano nel derma medio. Il canale deve essere allestito alla profondità esatta affinché i terminali emergano dritti senza trazionare verso l'alto.",
  "placements.surface.p2": "Segnali d'allarme: I terminali iniziano a piegarsi lateralmente, la barra orizzontale è palpabile come un cordoncino rigido o si forma un arrossamento continuo tra i due fori.",
  "placements.dermal.p1": "I microdermal possiedono una piastrina forata inserita sotto la cute attraverso la quale il tessuto ricresce per ancorarla. Presentano un solo punto di uscita.",
  "placements.dermal.p2": "Segnali d'allarme: La base comincia a inclinarsi, il colletto emerge visibilmente sopra il piano cutaneo o l'ancoraggio traballa alla palpazione.",
  "actions.heading": "Cosa può fare concretamente un piercer",
  "actions.lead": "Non esistono lozioni in grado di bloccare un rigetto in atto. Un intervento professionale tempestivo può tuttavia risolvere i fattori scatenanti.",
  "actions.act1.title": "1. Passare a una barra più corta (downsize)",
  "actions.act1.desc": "Se la barra iniziale è troppo lunga e viene urtata di continuo, sostituirla con una su misura azzera l'effetto leva proteggendo il canale.",
  "actions.act2.title": "2. Cambiare tipologia di gioiello, terminali o materiale",
  "actions.act2.desc": "Sostituire terminali grandi o sporgenti con dischi piatti a basso profilo riduce gli impigliamenti. Passare da metalli economici a titanio ASTM F-136 o copolimero medico PP-R per gioielleria per il corpo BioFlex® rimuove le irritazioni da contatto.",
  "actions.act3.title": "3. Rimuovere e riposizionare (rifare il foro in seguito)",
  "actions.act3.desc": "Rimuovere il gioiello tempestivamente a cute ancora sana consente una chiusura rapida con esiti cicatriziali minimi. Dopo 3-6 mesi il piercing potrà essere rieseguito con un angolo ottimale.",
  "actions.act4.title": "4. La realtà oggettiva: un piercing in rigetto attivo di solito va rimosso",
  "actions.act4.desc": "Quando il corpo ha avviato l'espulsione e la cute si è vistosamente assottigliata, nessun prodotto può invertire il decorso. Insistere porta solo a lacerazioni e cicatrici permanenti.",
  "rejection.title": "Dopo il rigetto di un piercing",
  "rejection.body": "Se un piercing è stato espulso o rimosso, lascia guarire il tessuto senza sfregare o applicare prodotti caustici. Per comprendere la differenza tra normale tessuto cicatriziale e cheloidi autentici, consulta la nostra",
  "rejection.linkText": "Guida e strumento di valutazione dei cheloidi da piercing",
  "print.sheetTitle": "Scheda dei segni di migrazione e misurazioni del piercing",
  "print.sheetSubtitle": "Strumento per studi Poli International: Scheda di monitoraggio e storico",
  "print.clientEntryNote": "Conserva questa scheda con le date e le misurazioni in millimetri da mostrare al tuo piercer alla prossima visita di controllo.",
  "factors.placement.title": "1. Posizionamento del piercing e architettura dei tessuti",
  "factors.fit.title": "2. Lunghezza e vestibilità del gioiello",
  "factors.material.title": "3. Materiale del gioiello e biocompatibilità",
  "factors.trauma.title": "4. Attrito, sfregamenti e pressione",
  "factors.aftercare.title": "5. Routine di cura e manipolazione",
  "factors.history.title": "6. Storia di guarigione e stato dei tessuti"
};

// Verify all 7 languages have all 175 keys
const langs = { en, es, fr, de, it, pt, nl };
const enKeyList = Object.keys(en);
console.log('EN key count:', enKeyList.length);

for (const [langName, dict] of Object.entries(langs)) {
  const kList = Object.keys(dict);
  if (kList.length !== enKeyList.length) {
    console.error('MISMATCH in', langName, 'count:', kList.length, 'vs', enKeyList.length);
    const missing = enKeyList.filter(k => !kList.includes(k));
    console.error('Missing in', langName, ':', missing);
    process.exit(1);
  }
}

// Generate new js/i18n.js
const header = `/**
 * @license
 * Poli International: Piercing Migration & Rejection Risk Tool V2
 * Pure client-side i18n dictionary and translation lookup.
 */
(function(window) {
  'use strict';

  var I18N = ${JSON.stringify(langs, null, 2)};

  var currentLang = 'en';
  var STORAGE_KEY = 'poli_tools_language';

  function initLanguage() {
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    if (stored && I18N[stored]) {
      currentLang = stored;
    } else {
      currentLang = 'en';
    }
    document.documentElement.lang = currentLang;
    return currentLang;
  }

  function getLanguage() {
    return currentLang;
  }

  function setLanguage(lang) {
    if (I18N[lang]) {
      currentLang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, currentLang);
      } catch (e) {}
      document.documentElement.lang = currentLang;
    }
  }

  function translate(key, params) {
    var dict = I18N[currentLang] || I18N.en;
    var str = dict[key] || I18N.en[key] || key;
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(function(k) {
        str = str.replace(new RegExp('\\\\{' + k + '\\\\}', 'g'), params[k]);
      });
    }
    return str;
  }

  function t(key, params) {
    return translate(key, params);
  }

  function getDictionaryKeysCount(lang) {
    var d = I18N[lang] || I18N.en;
    return Object.keys(d).length;
  }

  window.translate = translate;
  window.PoliI18n = {
    I18N: I18N,
    t: t,
    translate: translate,
    initLanguage: initLanguage,
    getLanguage: getLanguage,
    setLanguage: setLanguage,
    getDictionaryKeysCount: getDictionaryKeysCount
  };

  initLanguage();

})(window);
`;

fs.writeFileSync('js/i18n.js', header, 'utf8');
console.log('Successfully wrote js/i18n.js with all 7 languages!');
