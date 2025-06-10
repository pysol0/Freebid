# Freebid
## Generali
Il software di Freebid é nato nel 2022, il suo unico obiettivo é quello di automatizzare il processo di riscossione delle puntate gratuite sul famoso sito di aste bidoo.com. Specifico che non c'é nessuna connessione tra l'attivitá di Freebid e quella di Bidoo. Ho deciso di rilasciare quest'ultima versione open source e gratuita per tutti, con la quale i dati dell'utente sono salvati solo in locale, ricca di nuove funzionalitá, e disponibile per tutti i maggiori sistemi operativi. Se trovi che questo progetto sia interessante o utile, non dimenticarti di lasciare una stella ⭐.
## Istallazione 
### Importante
Se non userai la versione portatile del software é importante che tu sappia che tra le dipendenze di Freebid é presente node-gyp che, a sua volta, ha alcuni prerequisiti, puoi trovare tutte le informazioni utili [qui](https://github.com/nodejs/node-gyp).
Inoltre se ottieni un qualsiasi errore quando avvii il programma ti consiglio di rimuovere tutti gli spazi dai nomi di qualsiasi cartella che fa parte del percoroso del software.
### Windows (verificato)
Su windows puoi usare una versione portatile del software impacchettata come archivio (metodo piú facile):
- [archivio](https://github.com/pysol0/Freebid/releases)

Oppure puoi clonare la repository e lanciare il programma con i seguenti comandi:
- `git clone pysol0/Freebid`
- `npm install`
- `npm run start`
Sará necessaria un'installazione di chrome, e aggiungere il suo percorso nella variabile `main.js` -> `const chrome_path = ""` 

### MacOS (verificato)
Su MacOS puoi solo clonare la repository ed eseguire gli stessi comandi che eseguiresti su Windows
### Linux (non verificato, dovrebbe funzionare bene)
Su Linux puoi solo clonare la repository ed eseguire gli stessi comandi che eseguiresti su Windows
## Primo avvio
La prima volta che avvierai Freebid ti chiederá di inserire un api Id e un api Hash, sotto i campi di testo ci sará un link alla pagina per ottenerli , ti servirá un account telegram ( [here](https://www.youtube.com/watch?v=tzYTLjdr7rI) un breve video tutorial ). 
Dopo averli inseriti Freebid si chiuderá da solo, e una volta riavviato, se i dati che hai inserito saranno corretti, ti chiederá di fare il login con telegram tramite qrcode. Una volta fatto ció ti troverai sulla schermata principale del software.
Prima di poter usare il programma dovrai fare due cose:
- aggiungere almeno un account 
- selezionare uno o piú canali dai quali estrarre i link per le puntate, accedendo alle impostazioni tramite il pulsante in basso a destra

Ora puoi iniziare a esplorare tutte le funzionalitá Freebid.
## Informazioni utili
- Quando selezioni i canali, é consigliato scegliere quelli dove vengono pubblicati solo i link delle puntate; il programma integra un sistema di filtraggio dei messaggi, ma potresti incontrare dei bug
- Freebid supporta anche gli account spagnoli, puoi aggiungerli come tutti gli altri
- Quando imposti la riscossione automatica con l'intervallo di tempo, il programma deve rimanere aperto

## Conclusioni
Al momento Freebid é completamente open source, il che implica che sono fortemente apprezzate proposte di cambiamenti, soluzioni per bug e integrazione di nuove funzionalitá. Se ti imbatti in un qualsiasi problema puoi segnalarlo nelle issues ed io insieme alla community ci impegneremo ad aiutarti. Buon uso di Freebid!

Icone e animazioni fornite da [Icons8](https://icons8.com/) e [LottieFiles](https://lottiefiles.com/free-animations/free).
