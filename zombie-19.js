// Personne
class Person {
    constructor(name, age, variants = [], isImmuned = false, canInfect = true, isDead = false) {
        this.name = name;
        this.age = age;
        this.variants = variants;
        this.isImmuned = isImmuned;
        this.canInfect = canInfect;
        this.isDead = isDead;
        this.parent = null;
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
        this.children.forEach(child => {
            child.parent = this;
        });
    }
}


// Création de l'arbre
const rootNode = new Person("Victor", 53);
const child1 = new Person("Anne", 25);
const child2 = new Person("Sylvain", 32, ["Zombie-A"]);

const grandChild1 = new Person("Marie", 22);
const grandChild2 = new Person("Julien", 45, ["Zombie-32"]);

const grandChild3 = new Person("Tom", 84);
const grandChild4 = new Person("Elina", 16, ["Zombie-C"]);

const greatGrandChild1 = new Person("Martin", 33, ["Zombie-B"]);
const greatGrandChild2 = new Person("Léa", 24, ["Zombie-Ultime"]);

child1.addChild(grandChild1);
child1.addChild(grandChild2);
child2.addChild(grandChild3);
child2.addChild(grandChild4);

grandChild1.addChild(greatGrandChild1);
grandChild4.addChild(greatGrandChild2);

rootNode.addChild(child1);
rootNode.addChild(child2);


// Initialisation des variables pour le récapitulatif
let deadPeople = [];
let vaccineA1People = [];
let vaccineB1People = [];
let ultimateVaccinePeople = [];
let infectedBy = {
    'Zombie-A': [],
    'Zombie-B': [],
    'Zombie-32': [],
    'Zombie-C': [],
    'Zombie-Ultime': [],
};
let survivors = [];

// Récupère les survivants
function collectSurvivors(person) {
    if (!person.isDead) {
        survivors.push(person.name);
    }
    person.children.forEach(child => collectSurvivors(child));
}


// Permet de savoir si une personne est susceptible d'être infectée
function isSusceptible(person, variant, condition = () => true) {
    return !person.isImmuned && !person.isDead && !person.variants.includes(variant) && person.canInfect && condition(person);
}

// Infection du haut vers le bas de l'arbre
function spreadDownward(person, variant, condition) {
    if (isSusceptible(person, variant, condition)) {
        console.log(`${person.name} a été infecté(e) avec le variant ${variant}`);
        person.variants.push(variant);
        infectedBy[variant].push(person.name);
    }
    person.children.forEach(child => spreadDownward(child, variant, condition));
}

// Infecte du bas vers le haut de l'arbre
function spreadUpward(person, variant, condition) {
    if (isSusceptible(person, variant, condition)) {
        console.log(`${person.name} a été infecté(e) avec le variant ${variant}`);
        person.variants.push(variant);
        infectedBy[variant].push(person.name);
    }
    if (person.parent) {
        spreadUpward(person.parent, variant, condition);
    }
}

// Infecte une personne sur deux dans l'arbre
function spreadAlternate(person, variant) {
    person.children.filter((_, index) => index % 2 === 0).forEach(child => {
        if (isSusceptible(child, variant)) {
            console.log(`${child.name} a été infecté(e) avec le variant ${variant}`);
            child.variants.push(variant);
            infectedBy[variant].push(child.name);
        }
    });
}

// Infecte l'arbre
function initiateInfection(person) {
    person.variants.forEach(variant => {
        switch (variant) {
            case 'Zombie-A':
                spreadDownward(person, 'Zombie-A');
                break;
            case 'Zombie-B':
                spreadUpward(person, 'Zombie-B');
                break;
            case 'Zombie-32':
                spreadDownward(person, 'Zombie-32', person => person.age >= 32);
                spreadUpward(person, 'Zombie-32', person => person.age >= 32);
                break;
            case 'Zombie-C':
                spreadAlternate(person, 'Zombie-C');
                break;
            case 'Zombie-Ultime':
                spreadUpward(person, 'Zombie-Ultime', person => !person.parent);
                break;
        }
    });

    person.children.forEach(child => initiateInfection(child));
}

// Vaccin-A.1 contre Zombie-A et Zombie-32 : N’est pas encore très efficace il permet de soigner toutes les personnes d’un âge compris entre 0 ans et 30 ans et de les immuniser contre tous les variants (Ascendant et Descendant)
function applyVaccineA1(person) {
    if (person.variants.includes('Zombie-A') || person.variants.includes('Zombie-32')) {
        if (person.age <= 30) {
            console.log(`${person.name} a été vacciné(e) avec le vaccin A1 et est devenu(e) immunisé(e)`);
            person.variants = [];
            person.isImmuned = true;
            vaccineA1People.push(person.name);
        }
    }
    person.children.forEach(child => applyVaccineA1(child));
}

// Vaccin-B.1 contre Zombie-B et Zombie-C : Il tue une personne sur 2 et soigne les autres mais ne leur donne pas l’immunité. (Ascendant et Descendant)
function applyVaccineB1(person) {
    if (person.variants.includes('Zombie-B') || person.variants.includes('Zombie-C')) {
        if (deathIndex % 2 === 0) {
            console.log(`${person.name} a été vacciné(e) avec le vaccin B1`);
            person.variants = person.variants.filter(variant => variant !== 'Zombie-B' && variant !== 'Zombie-C');
            vaccineB1People.push(person.name);
        } else {
            console.log(`${person.name} est mort(e)`);
            person.isDead = true;
            deadPeople.push(person.name);
        }
        deathIndex++;
    }
    person.children.forEach(child => applyVaccineB1(child));
}

// Vaccin-Ultime contre Zombie-Ultime : Son porteur ne pourra plus jamais être infecté et infecter les autres.
function applyUltimateVaccine(person) {
    if (person.variants.includes('Zombie-Ultime')) {
        console.log(`${person.name} a été vacciné avec le vaccin Ultime et est devenu(e) immunisé(e)`);
        person.variants = [];
        person.isImmuned = true;
        person.canInfect = false;
        ultimateVaccinePeople.push(person.name);
    }
    person.children.forEach(child => applyUltimateVaccine(child));
}


// Initialisation de l'infection
console.log('%c----------------------------------------', 'background: #222; color: #bada55')
console.log(`%c           Début de l'infection`, 'background: #222; color: #bada55');
console.log('%c----------------------------------------', 'background: #222; color: #bada55')
initiateInfection(rootNode);

console.log('%c----------------------------------------', 'background: #222; color: #bada55')
console.log(`%c           Vaccination A1`, 'background: #222; color: #bada55');
console.log('%c----------------------------------------', 'background: #222; color: #bada55')
applyVaccineA1(rootNode);

console.log('%c----------------------------------------', 'background: #222; color: #bada55')
console.log(`%c           Vaccination B1`, 'background: #222; color: #bada55');
console.log('%c----------------------------------------', 'background: #222; color: #bada55')
let deathIndex = 0;
applyVaccineB1(rootNode);

console.log('%c----------------------------------------', 'background: #222; color: #bada55')
console.log(`%c           Vaccination Ultime`, 'background: #222; color: #bada55');
console.log('%c----------------------------------------', 'background: #222; color: #bada55')
applyUltimateVaccine(rootNode);


// Résultats (ne prend pas en compte ceux qui sont contaminés à la base dans les personnes contaminées)
collectSurvivors(rootNode);
console.log('%c----------------------------------------', 'background: #222; color: #bada55')
console.log(`%c           Récapitulatif`, 'background: #222; color: #bada55');
console.log('%c----------------------------------------', 'background: #222; color: #bada55')
console.log('Personnes contaminées par le variant Zombie-A :', infectedBy['Zombie-A'].join(', '));
console.log('Personnes contaminées par le variant Zombie-B :', infectedBy['Zombie-B'].join(', '));
console.log('Personnes contaminées par le variant Zombie-32 :', infectedBy['Zombie-32'].join(', '));
console.log('Personnes contaminées par le variant Zombie-C :', infectedBy['Zombie-C'].join(', '));
console.log('Personnes contaminées par le variant Zombie-Ultime :', infectedBy['Zombie-Ultime'].join(', '));
console.log('Personnes vaccinées par le vaccin A1 et immunisées :', vaccineA1People.join(', '));
console.log('Personnes vaccinées par le vaccin B1 :', vaccineB1People.join(', '));
console.log('Personnes vaccinées par le vaccin Ultime et immunisées :', ultimateVaccinePeople.join(', '));
console.log('Personnes mortes :', deadPeople.join(', '));
console.log('Personnes ayant survécu :', survivors.join(', '));