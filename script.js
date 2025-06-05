document.addEventListener('DOMContentLoaded', function () {
    const cryptoData = {
        'BTC': { name: 'Bitcoin', symbol: 'BTC', rank: 1, description: 'La première et la plus connue des cryptomonnaies, souvent considérée comme de l\'or numérique.', basePrice: 40000, volatilityFactor: 1.2, marketCapMillions: 750000, volumeMillions: 30000, circulatingSupplyMillions: 19.5 },
        'ETH': { name: 'Ethereum', symbol: 'ETH', rank: 2, description: 'Une plateforme décentralisée qui exécute des contrats intelligents : des applications qui fonctionnent exactement comme programmées sans aucune possibilité de temps d\'arrêt, de censure, de fraude ou d\'interférence de tiers.', basePrice: 2500, volatilityFactor: 1.5, marketCapMillions: 300000, volumeMillions: 15000, circulatingSupplyMillions: 120 },
        'BNB': { name: 'BNB', symbol: 'BNB', rank: 3, description: 'La cryptomonnaie native de la plateforme d\'échange Binance et de la BNB Chain.', basePrice: 300, volatilityFactor: 1.4, marketCapMillions: 45000, volumeMillions: 1000, circulatingSupplyMillions: 150 },
        'XRP': { name: 'XRP', symbol: 'XRP', rank: 4, description: 'Conçu pour les paiements transfrontaliers rapides et à faible coût par Ripple Labs.', basePrice: 0.5, volatilityFactor: 1.8, marketCapMillions: 25000, volumeMillions: 1200, circulatingSupplyMillions: 50000 },
        'ADA': { name: 'Cardano', symbol: 'ADA', rank: 5, description: 'Une plateforme blockchain de preuve d\'enjeu qui vise à permettre aux "acteurs du changement, aux innovateurs et aux visionnaires" d\'apporter un changement mondial positif.', basePrice: 0.3, volatilityFactor: 1.7, marketCapMillions: 10000, volumeMillions: 300, circulatingSupplyMillions: 35000 },
        'DOGE': { name: 'Dogecoin', symbol: 'DOGE', rank: 6, description: 'Initialement une cryptomonnaie "mème" basée sur le mème Internet "Doge".', basePrice: 0.07, volatilityFactor: 2.5, marketCapMillions: 9000, volumeMillions: 500, circulatingSupplyMillions: 140000 },
        'SOL': { name: 'Solana', symbol: 'SOL', rank: 7, description: 'Une blockchain haute performance conçue pour la vitesse et l\'évolutivité.', basePrice: 20, volatilityFactor: 2.0, marketCapMillions: 8000, volumeMillions: 600, circulatingSupplyMillions: 400 },
        'DOT': { name: 'Polkadot', symbol: 'DOT', rank: 8, description: 'Permet des transferts inter-blockchains de tout type de données ou d\'actifs, pas seulement des tokens.', basePrice: 5, volatilityFactor: 1.6, marketCapMillions: 6000, volumeMillions: 200, circulatingSupplyMillions: 1200 },
        'SHIB': { name: 'Shiba Inu', symbol: 'SHIB', rank: 9, description: 'Une autre cryptomonnaie mème, se présentant comme un "Dogecoin killer".', basePrice: 0.000008, volatilityFactor: 3.0, marketCapMillions: 4500, volumeMillions: 250, circulatingSupplyMillions: 589000000 },
        'AVAX': { name: 'Avalanche', symbol: 'AVAX', rank: 10, description: 'Une plateforme pour les applications décentralisées et les réseaux blockchain personnalisés.', basePrice: 12, volatilityFactor: 1.9, marketCapMillions: 4000, volumeMillions: 220, circulatingSupplyMillions: 350 }
    };

    let priceChartCrypto, rsiChartCrypto;
    let currentCryptoSymbol = 'BTC';
    let sma20CryptoVisible = false;
    let sma50CryptoVisible = false;

    function formatLargeNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + ' T $';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + ' Md $';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M $';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + ' k $';
        return num + ' $';
    }
    
    function formatSupply(num, symbol) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + ' Md ' + symbol;
        if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M ' + symbol;
        return num.toLocaleString('fr-FR') + ' ' + symbol;
    }


    function generateCryptoFakeData(crypto) {
        const base = crypto.basePrice;
        const volatility = 0.03 * crypto.volatilityFactor; // Base volatility for cryptos
        let currentDate = new Date();
        currentDate.setFullYear(currentDate.getFullYear() - 1); // One year of data
        const data = [];
        let lastPrice = base;
        let lastRsiGain = 0;
        let lastRsiLoss = 0;

        for (let i = 0; i < 365; i++) {
            const changePercent = (2 * volatility * Math.random() - volatility) + (Math.random() * 0.005 - 0.0025); // Random walk with slight drift
            lastPrice *= (1 + changePercent);
            lastPrice = Math.max(lastPrice, base * 0.1, 0.00000001); // Ensure price doesn't go too low or negative
            
            const change = changePercent * lastPrice; // Calculate actual change
            const gain = Math.max(0, change);
            const loss = Math.max(0, -change);
            
            lastRsiGain = (lastRsiGain * 13 + gain) / 14; // Smoothed average gain
            lastRsiLoss = (lastRsiLoss * 13 + loss) / 14; // Smoothed average loss
            
            const rs = lastRsiLoss === 0 ? Infinity : lastRsiGain / lastRsiLoss; // Relative Strength
            const rsi = rs === Infinity ? 100 : 100 - (100 / (1 + rs));
            
            data.push({
                date: new Date(currentDate),
                price: parseFloat(lastPrice.toFixed(8)), // Higher precision for some cryptos
                rsi: parseFloat(rsi.toFixed(2))
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return data;
    }

    function calculateCryptoSMA(data, windowSize) {
        let sma = [];
        for (let i = 0; i < data.length; i++) {
            if (i < windowSize - 1) {
                sma.push(null);
            } else {
                let sum = 0;
                for (let j = 0; j < windowSize; j++) {
                    sum += data[i - j].price;
                }
                sma.push(parseFloat((sum / windowSize).toFixed(8)));
            }
        }
        return sma;
    }

    function createCryptoCharts() {
        const priceCtx = document.getElementById('priceChartCrypto').getContext('2d');
        priceChartCrypto = new Chart(priceCtx, {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { y: { beginAtZero: false, ticks: { callback: function(value) { return '$' + value.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: value < 1 ? 8 : 2}); } } }, x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 7 } } },
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.y !== null) { label += '$' + context.parsed.y.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: context.parsed.y < 1 ? 8 : 2});} return label;}}}}
            }
        });

        const rsiCtx = document.getElementById('rsiChartCrypto').getContext('2d');
        rsiChartCrypto = new Chart(rsiCtx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'RSI (14)', data: [], borderColor: '#a855f7', borderWidth: 2, pointRadius: 0, tension: 0.1 }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                scales: { y: { min: 0, max: 100 }, x: { display: false } }
            }
        });
    }

    function updateCryptoUI(symbol) {
        currentCryptoSymbol = symbol;
        const crypto = cryptoData[symbol];
        const data = generateCryptoFakeData(crypto);
        
        const labels = data.map(d => d.date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric'}));
        const prices = data.map(d => d.price);
        const rsiValues = data.map(d => d.rsi);

        document.getElementById('cryptoLogo').textContent = crypto.symbol.substring(0,1);
        document.getElementById('cryptoNameAndSymbol').innerText = `${crypto.name} (${crypto.symbol})`;
        document.getElementById('cryptoDescription').innerText = crypto.description;
        document.getElementById('cryptoMarketCap').innerText = formatLargeNumber(crypto.marketCapMillions * 1e6);
        document.getElementById('cryptoVolume').innerText = formatLargeNumber(crypto.volumeMillions * 1e6);
        document.getElementById('cryptoCirculatingSupply').innerText = formatSupply(crypto.circulatingSupplyMillions * (crypto.symbol === 'SHIB' ? 1e6 : 1) , crypto.symbol); // SHIB is in millions of millions
        document.getElementById('cryptoRank').innerText = `#${crypto.rank}`;

        priceChartCrypto.data.labels = labels;
        priceChartCrypto.data.datasets = [{
            label: 'Cours ($)',
            data: prices,
            borderColor: '#3b82f6', // Blue
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2, pointRadius: 0, tension: 0.1, fill: true
        }];

        if (sma20CryptoVisible) addSmaToCryptoChart(calculateCryptoSMA(data, 20), 20);
        if (sma50CryptoVisible) addSmaToCryptoChart(calculateCryptoSMA(data, 50), 50);

        priceChartCrypto.update();

        rsiChartCrypto.data.labels = labels;
        rsiChartCrypto.data.datasets[0].data = rsiValues;
        rsiChartCrypto.update();

        updateCryptoOutlook(crypto, data[data.length - 1]);
    }
    
    function addSmaToCryptoChart(smaData, period) {
        const colors = { 20: '#f59e0b', 50: '#10b981' }; // Amber, Green
        priceChartCrypto.data.datasets.push({
            label: `SMA ${period}`, data: smaData,
            borderColor: colors[period], borderWidth: 1.5, pointRadius: 0, tension: 0.1, fill: false
        });
    }

    function toggleSmaCrypto(period) {
        if (period === 20) sma20CryptoVisible = !sma20CryptoVisible;
        if (period === 50) sma50CryptoVisible = !sma50CryptoVisible;
        updateCryptoUI(currentCryptoSymbol);
        updateSmaCryptoButtons();
    }

    function updateSmaCryptoButtons() {
        document.getElementById('toggleSma20Crypto').classList.toggle('bg-indigo-500', sma20CryptoVisible);
        document.getElementById('toggleSma20Crypto').classList.toggle('text-white', sma20CryptoVisible);
        document.getElementById('toggleSma50Crypto').classList.toggle('bg-indigo-500', sma50CryptoVisible);
        document.getElementById('toggleSma50Crypto').classList.toggle('text-white', sma50CryptoVisible);
    }

    function updateCryptoOutlook(crypto, latestData) {
        const outlookCard = document.getElementById('outlookCard');
        const outlookSignal = document.getElementById('outlookSignal');
        const outlookConfidence = document.getElementById('outlookConfidence');
        
        outlookCard.className = 'bg-white p-6 rounded-lg shadow'; // Reset classes
        
        let signal, confidence, className;
        const rsi = latestData.rsi;
        const price = latestData.price;
        
        // Simplified outlook logic
        if (rsi < 35 && crypto.volatilityFactor < 2) {
            signal = 'HAUSSIER'; confidence = 60 + Math.floor(Math.random() * 15); className = 'outlook-positive';
        } else if (rsi > 65 && crypto.volatilityFactor > 1.8) {
            signal = 'BAISSIER'; confidence = 55 + Math.floor(Math.random() * 15); className = 'outlook-negative';
        } else if (rsi > 40 && rsi < 60) {
            signal = 'NEUTRE'; confidence = 70 + Math.floor(Math.random() * 10); className = 'outlook-neutral';
        } else { // Default to neutral with less confidence for edge cases
            signal = 'MIXTE'; confidence = 50 + Math.floor(Math.random() * 10); className = 'outlook-neutral';
        }

        outlookSignal.innerText = signal;
        outlookConfidence.innerText = `Confiance Estimée : ${confidence}%`;
        outlookCard.classList.add(className);
    }

    function initCryptoApp() {
        const selector = document.getElementById('cryptoSelector');
        Object.keys(cryptoData).sort((a,b) => cryptoData[a].rank - cryptoData[b].rank).forEach(symbol => {
            const option = document.createElement('option');
            option.value = symbol;
            option.innerText = `${cryptoData[symbol].name} (${cryptoData[symbol].symbol})`;
            selector.appendChild(option);
        });

        selector.addEventListener('change', (e) => updateCryptoUI(e.target.value));
        
        document.getElementById('toggleSma20Crypto').addEventListener('click', () => toggleSmaCrypto(20));
        document.getElementById('toggleSma50Crypto').addEventListener('click', () => toggleSmaCrypto(50));

        createCryptoCharts();
        updateCryptoUI(currentCryptoSymbol); // Load default crypto
        updateSmaCryptoButtons();
    }

    initCryptoApp();
});