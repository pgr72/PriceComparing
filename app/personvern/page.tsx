import Header from "@/components/Header";

export default function Personvern() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h2 className="text-3xl font-bold mb-8">Personvernerklæring</h2>
        <p className="text-sm text-gray-500 mb-8">Sist oppdatert: 16. mars 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Behandlingsansvarlig</h3>
            <p>
              Per Gunnar Rækken er behandlingsansvarlig for behandlingen av personopplysninger
              på PriceCompare. Har du spørsmål om personvern, kan du kontakte oss på{" "}
              <a href="mailto:pg.rakken@gmail.com" className="text-blue-700 underline">
                pg.rakken@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Hvilke opplysninger samler vi inn?</h3>
            <p className="mb-3">Vi samler inn følgende opplysninger når du bruker tjenesten:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Kontoinformasjon:</strong> E-postadresse og navn når du oppretter en konto.</li>
              <li><strong>Handlevogn:</strong> Produkter du legger til i handlevognen lagres knyttet til din konto.</li>
              <li><strong>Prisvarslinger:</strong> Produkter og prisgrenser du setter opp for e-postvarsling.</li>
              <li><strong>Brukerpreferanser:</strong> Innstillinger for e-postvarsling og terskelverdier for tilbud.</li>
            </ul>
            <p className="mt-3">
              For brukere uten konto lagres handlevognen lokalt i nettleseren (localStorage) og
              sendes ikke til våre servere.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Formål med behandlingen</h3>
            <p className="mb-3">Vi bruker opplysningene til å:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Opprette og administrere din brukerkonto</li>
              <li>Lagre handlevogn og prisvarslinger</li>
              <li>Sende e-postvarsler når priser faller under dine målpriser</li>
              <li>Forbedre tjenesten og brukeropplevelsen</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Bruk av informasjonskapsler (cookies)</h3>
            <p className="mb-3">PriceCompare bruker følgende informasjonskapsler:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Nødvendige cookies:</strong> Supabase autentiserings-cookies for innlogging
                og sesjonshåndtering. Disse er nødvendige for at tjenesten skal fungere.
              </li>
              <li>
                <strong>Annonsecookies (fremtidig):</strong> Vi kan komme til å bruke Google AdSense
                for å vise annonser. Google AdSense bruker cookies for å vise relevante annonser
                basert på dine besøk på denne og andre nettsider. Du kan velge bort personaliserte
                annonser via{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline"
                >
                  Googles annonseinnstillinger
                </a>.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Tredjepartstjenester</h3>
            <p className="mb-3">Vi bruker følgende tredjepartstjenester:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Supabase:</strong> Hosting av database og brukerautentisering. Data lagres
                sikkert i henhold til Supabases personvernpraksis.
              </li>
              <li>
                <strong>Resend:</strong> Sending av e-postvarsler om prisendringer. Din e-postadresse
                deles med Resend kun for dette formålet.
              </li>
              <li>
                <strong>Norges Bank:</strong> Vi henter offentlig tilgjengelige valutakurser fra
                Norges Banks API. Ingen personopplysninger deles med Norges Bank.
              </li>
              <li>
                <strong>Vercel:</strong> Hosting av nettsiden. Vercel kan samle inn anonyme
                bruksdata i henhold til sin personvernpolicy.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Dine rettigheter</h3>
            <p className="mb-3">
              I henhold til personvernforordningen (GDPR) har du følgende rettigheter:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Innsyn:</strong> Du har rett til å få vite hvilke opplysninger vi har om deg.</li>
              <li><strong>Retting:</strong> Du kan be om at uriktige opplysninger rettes.</li>
              <li><strong>Sletting:</strong> Du kan be om at opplysningene dine slettes.</li>
              <li><strong>Dataportabilitet:</strong> Du kan be om å få utlevert dine data i et maskinlesbart format.</li>
              <li><strong>Innsigelse:</strong> Du kan protestere mot behandling av dine personopplysninger.</li>
            </ul>
            <p className="mt-3">
              For å utøve dine rettigheter, kontakt oss på{" "}
              <a href="mailto:pg.rakken@gmail.com" className="text-blue-700 underline">
                pg.rakken@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Lagring og sikkerhet</h3>
            <p>
              Personopplysninger lagres så lenge du har en aktiv konto hos oss. Dersom du sletter
              kontoen din, vil opplysningene dine bli slettet. Vi bruker kryptering og sikre
              tilkoblinger (HTTPS) for å beskytte dine data.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Endringer i personvernerklæringen</h3>
            <p>
              Vi kan oppdatere denne personvernerklæringen ved behov. Eventuelle endringer vil bli
              publisert på denne siden med oppdatert dato. Vi anbefaler at du jevnlig sjekker
              denne siden for eventuelle endringer.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Klagerett</h3>
            <p>
              Dersom du mener at vi behandler personopplysninger i strid med regelverket, har du
              rett til å klage til Datatilsynet. Mer informasjon finner du på{" "}
              <a
                href="https://www.datatilsynet.no"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline"
              >
                datatilsynet.no
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
