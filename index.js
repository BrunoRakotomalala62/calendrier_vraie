const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;

const BASE_URL = 'https://www.calendrier-365.fr/jours-feries';

async function scrapeCalendrier(annee) {
  try {
    const url = `${BASE_URL}/${annee}.html`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const joursFeries = [];
    const rows = $('table.full-view-table tbody tr');
    
    rows.each((index, element) => {
      const tds = $(element).find('td');
      if (tds.length >= 3) {
        const dateText = $(tds[0]).text().trim();
        const nomFerie = $(tds[1]).text().trim();
        const jour = $(tds[2]).text().trim();
        const joursRestants = $(tds[3]).text().trim();
        
        if (dateText && nomFerie) {
          joursFeries.push({
            date: dateText,
            nom: nomFerie,
            jour: jour,
            joursRestants: parseInt(joursRestants) || joursRestants
          });
        }
      }
    });
    
    return joursFeries;
  } catch (error) {
    console.error('Erreur lors du scraping:', error.message);
    throw error;
  }
}

function genererCalendriersMensuels(annee) {
  const mois = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  const joursNoms = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const joursNomsCourts = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
  
  const calendriers = {};
  
  mois.forEach((nomMois, indexMois) => {
    const premierJour = new Date(annee, indexMois, 1);
    const dernierJour = new Date(annee, indexMois + 1, 0);
    const nombreJours = dernierJour.getDate();
    
    const semaines = [];
    let semaineActuelle = {
      Lundi: null,
      Mardi: null,
      Mercredi: null,
      Jeudi: null,
      Vendredi: null
    };
    
    for (let jour = 1; jour <= nombreJours; jour++) {
      const date = new Date(annee, indexMois, jour);
      const jourSemaine = date.getDay();
      const nomJour = joursNoms[jourSemaine];
      
      if (jourSemaine >= 1 && jourSemaine <= 5) {
        semaineActuelle[nomJour] = jour;
      }
      
      if (jourSemaine === 0 || jour === nombreJours) {
        if (Object.values(semaineActuelle).some(v => v !== null)) {
          semaines.push({ ...semaineActuelle });
        }
        semaineActuelle = {
          Lundi: null,
          Mardi: null,
          Mercredi: null,
          Jeudi: null,
          Vendredi: null
        };
      }
    }
    
    calendriers[nomMois] = {
      annee: annee,
      mois: nomMois,
      numeroMois: indexMois + 1,
      semaines: semaines
    };
  });
  
  return calendriers;
}

app.get('/', async (req, res) => {
  try {
    const annee = parseInt(req.query.annee) || 2026;
    const calendriers = genererCalendriersMensuels(annee);
    
    res.json({
      success: true,
      annee: annee,
      description: `Calendriers de Janvier à Décembre ${annee} (Lundi à Vendredi)`,
      calendriers: calendriers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/recherche', async (req, res) => {
  try {
    const annee = req.query.calendrier || req.query.annee || '2026';
    const joursFeries = await scrapeCalendrier(annee);
    
    res.json({
      success: true,
      titre: `Jours fériés ${annee}`,
      description: `Les jours fériés les plus communs de France en ${annee} sont mentionnés ci-dessous.`,
      annee: parseInt(annee),
      totalJoursFeries: joursFeries.length,
      joursFeries: joursFeries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Erreur lors de la récupération des jours fériés pour ${req.query.calendrier || '2026'}`,
      details: error.message
    });
  }
});

app.get('/calendriers/:annee', async (req, res) => {
  try {
    const annee = parseInt(req.params.annee) || 2026;
    const calendriers = genererCalendriersMensuels(annee);
    const joursFeries = await scrapeCalendrier(annee);
    
    res.json({
      success: true,
      annee: annee,
      calendriers: calendriers,
      joursFeries: {
        titre: `Jours fériés ${annee}`,
        description: `Les jours fériés les plus communs de France en ${annee}`,
        liste: joursFeries
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Routes disponibles:`);
  console.log(`  - GET / : Calendriers mensuels (Lundi-Vendredi)`);
  console.log(`  - GET /recherche?calendrier=2026 : Jours fériés`);
  console.log(`  - GET /calendriers/:annee : Calendriers + Jours fériés`);
});

module.exports = app;
