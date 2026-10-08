// Flytter listeelementet for "Storevik kommune" til toppen av organisasjonslisten,
// slik at man slipper å scrolle for å finne det. Lista lastes inn dynamisk (Angular).

const TARGET_TEXT = "Storevik kommune";
const ORG_LIST_PATH = "/fiks-konfigurasjon/velg-organisasjon";
// Feature branch-miljøer legger til en "/branch/<navn>"-prefiks foran den vanlige stien,
// f.eks. /branch/featurebes-db44/fiks-konfigurasjon/velg-organisasjon.
const ORG_LIST_PATH_REGEX = new RegExp(
  `^(/branch/[^/]+)?${ORG_LIST_PATH}$`
);

function isOrgListPage() {
  return ORG_LIST_PATH_REGEX.test(location.pathname);
}

function moveStorevikToTop() {
  if (!isOrgListPage()) {
    return;
  }

  const cards = document.querySelectorAll("li[ksd-card]");

  for (const li of cards) {
    // Bruk eksakt match på navneknappen, ikke "includes", for å unngå at f.eks.
    // "zzz Storevik kommune" også treffer og bytter plass med "Storevik kommune".
    const nameEl = li.querySelector("h2 button") || li.querySelector("button");
    const name = nameEl ? nameEl.textContent.replace(/\s+/g, " ").trim() : "";

    if (name !== TARGET_TEXT) {
      continue;
    }

    const parent = li.parentElement;
    if (parent && parent.firstElementChild !== li) {
      parent.insertBefore(li, parent.firstElementChild);
    }
  }
}

// Kjør ett umiddelbart forsøk i tilfelle listen allerede er rendret når skriptet lastes.
moveStorevikToTop();

// Med mange kommuner (som i test) rendrer Angular listen på nytt i flere omganger
// mens den bygges opp, noe som kan nullstille rekkefølgen. Reager derfor på alle
// DOM-endringer, samlet per animasjonsramme for ytelsen. En MutationObserver koster
// ingenting når ingenting endrer seg, så den kan trygt stå på resten av sidens levetid.
let moveScheduled = false;
function scheduleMove() {
  if (moveScheduled) {
    return;
  }
  moveScheduled = true;
  requestAnimationFrame(() => {
    moveScheduled = false;
    moveStorevikToTop();
  });
}

const observer = new MutationObserver(scheduleMove);
observer.observe(document.body, { childList: true, subtree: true });
