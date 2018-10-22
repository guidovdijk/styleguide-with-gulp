/*
    Stappen om een gulp tasks aan te roepen.

    1- Open je command prompt
    2- Ga naar de folder, type in je command prompt: cd (met een spatie erna) en sleep dan de folder in je command prompt en druk enter.
    3- Run 'npm install' en wacht tot het klaar is met het downloaden van de packages
    4- Run 'gulp watch' om te kijken naar de veranderingen (dit opent automatisch een nieuw tabblad in je browser)
       Run 'gulp production' om de huidige bestanden in de src folder te comprimeren en exporteren naar de production folder.
    5- Ga in de src folder naar een .js, .html en/of .scss bestand.
    6- Pas wat aan bijvoorbeeld een andere kleur tekst in de .scss, een nieuwe stukje tekst in je .html of een nieuwe variable in je .js.
    7- Sla de veranderingen op en de browser zou automatisch herlaaden en de veranderingen laten zien.

*/


// Laad alle benodigdheden in. (Als het word aangeroepen word er meer over deze benodigdheden verteld)
const gulp = require('gulp'),
cleanCSS = require('gulp-clean-css'),
sass = require('gulp-sass'),
htmlmin = require('gulp-htmlmin'),
uglify = require('gulp-uglify'),
browserSync = require('browser-sync').create(),
useref = require('gulp-useref'),
gulpIf = require('gulp-if'),
runSequence = require('run-sequence'),
del = require('del'),
imagemin = require('gulp-imagemin'),
cache = require('gulp-cache'),
eslint = require('gulp-eslint'),
sassLint = require('gulp-sass-lint');

// Paths naar bestanden.
const paths =  {
    production: {
        folder: 'production',
        images: 'production/images'
    },
    development: {
        folder: 'src',
        // De links met sterretjes worden zo gelezen door je systeem: 'src/assets/scripts/elke folder in scripts/elk javascript bestand'
        scripts: 'src/assets/scripts/**/*.js',
        styles: 'src/assets/styles/**/*.scss',
        html: 'src/**/*.html',
        // Alle png, jpg, gif en svg bestanden in de src/assets/images folder.
        images: 'src/assets/images/**/*.+(png|jpg|gif|svg)',
    },
    // De regels van de styleguides vind je in .sass-lint.yml voor de scss regels en .eslintrc.json voor de js.
    styleguides: {
        scss: './.sass-lint.yml',
        js: './.eslintrc.json',
    }
}


// gulp.task() initialiseerd een functie met twee argumenten: de naam van de task die je in je command prompt moet aanroepen om het te gebruiken
// en wat er uitgevoerd moet worden.
// De 'return' is nodig om de gulp.task te laten weten dat de taak async is. 
// (Een async function is een taak die op dezelfde tijd word ingeladen als een andere functie).
gulp.task('JsLint', function () {
    // gulp.src() is het path waar naar gekeken word, 
    // bij deze functie is het "paths.development.scripts" dat gelijk staat aan "src/assets/scripts/**\/*.js" in onze paths object.
    return gulp.src([paths.development.scripts])
    //  Met: .pipe() is het mogelijk om in een gulp.task meerdere taken aan elkaar te binden.
    //  In de eerste .pipe() roepen we een functie aan en in de tweede vragen we een 'argument' (?) ervan op genaamd 'format'
    .pipe(eslint())
    .pipe(eslint.format())
});

gulp.task('SassLint', function () {
    return gulp.src([paths.development.styles])
        .pipe(sassLint({
            // Je kunt zelf regels maken over hoe de code geschreven moet worden, dit heet een 'styleguide'.
            // in de JsLint task word het bestand .stylelint.json gelijk gebruikt, maar in dit object moet het worden aangegeven.
            configFile: paths.styleguides.scss,
        }))
        .pipe(sassLint.format())
});

// Hier maak ik een gulp.task() aan die kijkt naar veranderingen in mijn bestanden en herlaad de pagina als er een verandering heeft plaats gevonden.
gulp.task('browserSync', function() {
    // Initialiseer ik de browserSync
    browserSync.init({
        // Hte pad naar de developement folder word meegegeven aan de browserSync.
        // Omdat de browserSync moet weten naar welk bestand of folder het moet kijken.
        server: {
            baseDir: paths.development.folder
        },
    })
});
// Browser Sync maakt het ook mogelijk om je website te laten zien op elk apparaat en elk scherm (als je internet hebt).
// Als je 'gulp watch' runt in je command prompt krijg je vier linkjes te zien.
// De twee bovenste: Local en External zijn voor je site zelf en de andere twee voor het dashboard.
// Kopieer de External url, ga naar de link toe op een andere computer en als je de 'gulp watch' nog hebt draaien zou je de website zien.
// Dit maakt testen ook een stuk handiger, nu kan je gewoon testen op je mobiel zonder dat je de website online hoeft te zetten.

// Hier word de browserSync taak aangeroepen, samen met de andere taken waar de browserSync naar moet kijken.
// Het kijken naar de veranderingen van de bestanden wordt gedaan met de .watch(pad naar bestand, task die uitgevoerd moet worden), 
// met daarin het pad naar de bestanden waar het naar moet kijken, en daarna de gulp.task() die uitgevoerd moet worden
gulp.task('watch', ['browserSync', 'sass', 'JsLint'], function (){
    // Hier wordt de .watch gebruikt op alle scss bestanden in de development map, en hierop word de 'sass task' uitgevoerd.
    gulp.watch(paths.development.styles, ['sass']); 
    // browserSync heeft een handige functie: browserSync.reload, dit herlaadt de pagina als er veranderingen worden gemaakt in (bij deze) de .html files.
    // Omdat de HTML niet zoals de .scss omgezet hoeft te worden naar .css, maar alleen hoeft te kijken of er een verandering heeft plaats gevonden
    // word de browserSync.reload method hier gebruikt.
    gulp.watch(paths.development.html, browserSync.reload); 
    gulp.watch(paths.development.scripts, ['JsLint']); 
});

// Omdat de watch task al kijkt of er iets veranderd is in de .scss bestanden, 
// geef ik hier de SassLint functie mee om alles wat met elkaar te maken heeft bijelkaar te houden
gulp.task('sass', ['SassLint'], function() {
    return gulp.src(paths.development.styles)
        // Hier owrd de functie uitgevoerd en worden alle code die niet voldoet aan de styleguide gelogged in de command prompt.
        .pipe(sass({
            errLogToConsole: true
        }))
        // De gulp.dest is de DESTination waar het bestand terecht komt.
        // Nadat de code gelogged word naar de command prompt word het in de development folder gezet als css
        .pipe(gulp.dest(paths.development.folder))
        // Nadat alles is uitgevoerd word de browserSync.reload method aangeroepen om de pagina te herlaaden.
        .pipe(browserSync.reload({
            // De stream geeft de data terug van welke bestand(en) er is/zijn aangepst.
            stream: true
        }));
});

/* 
    Als je klaar bent met een project wil je het natuurlijk online zetten en wil je dat je website zo snel mogelijk laadt.
    Om je website zo snel mogelijk te laden kan je bestanden verkleinen, maar het is een hele klus omdat voor alle pagina's bij hand te doen.
    Hiervoor heb ik een gulp task gemaakt om alles te verkleinen met maar één command in je command prompt.
*/

// Als je in de index.html kijkt zie je bij de script tags twee comment erom heen.
// Deze comments zijn deel van de useref().
gulp.task('jsAndHtmlMinify', function(){
    return gulp.src(paths.development.html)
        // De useref() maakt het mogelijk om alle script tags samen te voegen in één bestand, zodat alles snel laadt.
        // Dit werkt ook met css bestanden.
        .pipe(useref())
        // Als alle bestanden samen gevoegd word door gulpIf() gekeken of het een javascript bestand is 
        // en als dat zo is word bestand verkleind met uglify().
        .pipe(gulpIf('*.js', uglify()))
        // Omdat useref() ook automatisch de html bestanden exporteerd, word er in deze task ook gelijk de html verkleind
        // d.m.v. htmlmin. Deze functie krijgt twee objecten mee: collapseWhitespace dat alle witruimte weghaald en removeComments om alle comments weg te halen.
        .pipe(htmlmin({ 
            collapseWhitespace: true,
            removeComments: true
        }))
        // Al deze veranderingen worden in een nieuwe folder gezet, zodat je huidige niet overschreven word.
        .pipe(gulp.dest(paths.production.folder))
    });
    
    gulp.task('sassMinify', function(){
        return gulp.src(paths.development.styles)
        // sass() om de scss bestanden om te zetten in css
        .pipe(sass())
        // cleanCSS om het css bestand te verkleinen
        .pipe(cleanCSS())
        // Al deze veranderingen worden in een nieuwe folder gezet, zodat je huidige niet overschreven word.
        .pipe(gulp.dest(paths.production.folder))
});

/*
    Meestal als je bestanden verkleind pas je de kwaliteit en/of hoogte, breedte aan, maar er is nog een manier om het te verkleinen.
    Elke afbeelding: png, jpg, gif, etc heeft 'meta data'. Meta data is data van: 
    wanneer de afbeelding is aangemaakt, 
    wanneer de afbeelding is bewerkt.
    En soms zit er een klein stuk tekst in over de afbeelding zelf.

    Dit allemaal word meegerekend in de totale grootte van het bestand.
    Het is mogelijk om dit weg te halen en het fijnste zou zijn als je alle afbeeldingen met één command kan verkleinen.
*/

// De task imagesMinify haald alle meta data van de afbeeldingen weg.
gulp.task('imagesMinify', function(){
    return gulp.src(paths.development.images)
        // Cache() om de afbeeldingen in de production folder op te slaan, omdat afbeeldingen comprimeren best veel tijd inbeslag neemt,
        // En de gebruiker niet de hele tijd wilt wachten op het comprimeren als de afbeeldingen.

        // imagemin() om de meta data van de afbeeldingen af te halen.
        .pipe(cache(imagemin()))
        // Gecomprimeerde bestanden worden in de image map in de productie folder opgeslagen.
        .pipe(gulp.dest(paths.production.images))
});

// Als er ooit wat mis gaat en je wilt de productie folder verwijderen (als bijvoorbeeld niet alle bestanden willen update), 
// kan dat met deze task de hele map verwijderen
gulp.task('clean:production', function() {
    // del.sync() om een folder te verwijderen, met daarin het pad naar de folder die je wilt verwijderen.
    return del.sync(paths.production.folder);
});

// De production task voert alle tasks uit die je aangeeft in de runSequence.
gulp.task('production', function(callback){
    // Array met alle gulp task die ik uitgevoerd wil hebben. Dit kan ook in de runSequence zelf staan, maar dit is overzichtelijker.
    const minify = [
        'jsAndHtmlMinify', 
        'sassMinify', 
        'imagesMinify'
    ];
    // De runSequence voert alle taken uit in specifieke volgorde. De reden dat ik runSequence gebruik is omdat ik eerst alles wil verwijderen uit de productie folder.
    // En als de andere tasks, bijvoorbeeld het afbeelding comprimeren eerder klaar is dan de 'clean:production', zouden de afbeeldingen verwijderd worden.
    // Omdat de 'clean:production' nog niet klaar was.
    // De volgorder van de runSequence is:
    // 'clean:production'
    // Alle tasks in de minify array
    // De callback functie.
    runSequence('clean:production', minify, callback);
});