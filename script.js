let cotacaoAtual = 0;
let graficoInstance = null;

// Função para buscar cotação
async function buscarCotacao() {
    try {
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
        const data = await response.json();
        
        cotacaoAtual = parseFloat(data.USDBRL.bid);
        const variacao = parseFloat(data.USDBRL.pctChange);
        
        // Atualizar cotação
        document.getElementById('cotacao').textContent = cotacaoAtual.toFixed(2).replace('.', ',');
        
        // Atualizar variação
        const variacaoElement = document.getElementById('variacao');
        variacaoElement.textContent = `${variacao > 0 ? '+' : ''}${variacao.toFixed(2)}%`;
        variacaoElement.className = 'variation ' + (variacao >= 0 ? 'positive' : 'negative');
        
        // Atualizar hora
        const agora = new Date();
        document.getElementById('atualizacao').textContent = agora.toLocaleTimeString('pt-BR');
        
        // Atualizar conversor
        calcularConversao();
        
        // Buscar histórico para o gráfico
        buscarHistorico();
        
    } catch (error) {
        console.error('Erro ao buscar cotação:', error);
        document.getElementById('cotacao').textContent = 'Erro';
    }
}

// Função para buscar histórico
async function buscarHistorico() {
    try {
        const response = await fetch('https://economia.awesomeapi.com.br/json/daily/USD-BRL/7');
        const data = await response.json();
        
        const labels = data.reverse().map(item => {
            const data = new Date(item.timestamp * 1000);
            return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        });
        
        const valores = data.map(item => parseFloat(item.bid));
        
        criarGrafico(labels, valores);
        
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
    }
}

// Função para criar gráfico
function criarGrafico(labels, valores) {
    const ctx = document.getElementById('grafico').getContext('2d');
    
    if (graficoInstance) {
        graficoInstance.destroy();
    }
    
    graficoInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            }
        }
    });
}

// Função para calcular conversão
function calcularConversao() {
    const dolar = parseFloat(document.getElementById('dolar').value) || 0;
    const real = dolar * cotacaoAtual;
    document.getElementById('real').value = real.toFixed(2);
}

// Event listeners
document.getElementById('dolar').addEventListener('input', calcularConversao);

// Buscar cotação inicial
buscarCotacao();

// Atualizar a cada 30 segundos
setInterval(buscarCotacao, 30000);