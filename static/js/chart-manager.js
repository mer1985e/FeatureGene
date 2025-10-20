/**
 * Chart Manager for handling Chart.js visualizations
 * Manages different chart types and themes
 */

class ChartManager {
    constructor(app) {
        this.app = app;
        this.currentChart = null;
        // Look for chart container first, then canvas
        this.chartContainer = document.querySelector('.chart-container') || document.getElementById('chart');
        this.setupChartContainer();
    }

    setupChartContainer() {
        if (!this.chartContainer) {
            console.warn('Chart container not found');
            return;
        }

        // Set initial dimensions
        this.chartContainer.style.width = '100%';
        this.chartContainer.style.height = '400px';
        this.chartContainer.style.position = 'relative';
        
        // Check if canvas already exists
        const existingCanvas = this.chartContainer.querySelector('canvas');
        
        if (!existingCanvas) {
            // Create canvas if it doesn't exist
            const canvas = document.createElement('canvas');
            canvas.id = 'chart';
            this.chartContainer.appendChild(canvas);
        }
    }

    destroyCurrentChart() {
        if (this.currentChart) {
            this.currentChart.destroy();
            this.currentChart = null;
        }
    }

    showLoadingState() {
        if (this.chartContainer) {
            this.chartContainer.innerHTML = `
                <div class="chart-loading">
                    <div class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span class="ml-2 text-gray-500">Loading chart...</span>
                </div>
            `;
        }
    }

    renderGAChart(data) {
        this.destroyCurrentChart();
        
        if (!this.chartContainer) {
            console.error('Chart container not found');
            return;
        }

        // Get existing canvas
        const canvas = this.chartContainer.querySelector('canvas');
        if (!canvas) {
            console.error('Canvas not found in chart container');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.history.map((_, i) => `Gen ${i + 1}`),
                datasets: [{
                    label: 'Best Fitness',
                    data: data.history,
                    borderColor: this.getThemeColor('primary'),
                    backgroundColor: this.getThemeColor('primary', 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.getThemeColor('primary'),
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Genetic Algorithm Fitness Progress',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.getThemeColor('text')
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: this.getThemeColor('text'),
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: this.getThemeColor('background'),
                        titleColor: this.getThemeColor('text'),
                        bodyColor: this.getThemeColor('text'),
                        borderColor: this.getThemeColor('border'),
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Generation',
                            color: this.getThemeColor('text')
                        },
                        grid: {
                            color: this.getThemeColor('grid'),
                            drawBorder: false
                        },
                        ticks: {
                            color: this.getThemeColor('text')
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Fitness Score',
                            color: this.getThemeColor('text')
                        },
                        grid: {
                            color: this.getThemeColor('grid'),
                            drawBorder: false
                        },
                        ticks: {
                            color: this.getThemeColor('text'),
                            callback: function(value) {
                                return value.toFixed(3);
                            }
                        },
                        beginAtZero: true,
                        max: 1
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    renderVarianceThresholdChart(data) {
        this.destroyCurrentChart();
        
        if (!this.chartContainer) return;

        // Get existing canvas
        const canvas = this.chartContainer.querySelector('canvas');
        if (!canvas) {
            console.error('Canvas not found in chart container');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Selected Features', 'Removed Features'],
                datasets: [{
                    label: 'Feature Count',
                    data: [data.numFeaturesSelected, data.removedFeatures.length],
                    backgroundColor: [
                        this.getThemeColor('success'),
                        this.getThemeColor('error')
                    ],
                    borderColor: [
                        this.getThemeColor('success', 0.8),
                        this.getThemeColor('error', 0.8)
                    ],
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Variance Threshold Feature Selection',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.getThemeColor('text')
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: this.getThemeColor('background'),
                        titleColor: this.getThemeColor('text'),
                        bodyColor: this.getThemeColor('text'),
                        borderColor: this.getThemeColor('border'),
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ${value} features`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: this.getThemeColor('text'),
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Number of Features',
                            color: this.getThemeColor('text')
                        },
                        grid: {
                            color: this.getThemeColor('grid'),
                            drawBorder: false
                        },
                        ticks: {
                            color: this.getThemeColor('text'),
                            stepSize: 1
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderComparisonChart(data) {
        this.destroyCurrentChart();
        
        if (!this.chartContainer) return;

        // Get existing canvas
        const canvas = this.chartContainer.querySelector('canvas');
        if (!canvas) {
            console.error('Canvas not found in chart container');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.ga.history.map((_, i) => `Gen ${i + 1}`),
                datasets: [
                    {
                        label: 'GA Fitness Progress',
                        data: data.ga.history,
                        borderColor: this.getThemeColor('primary'),
                        backgroundColor: this.getThemeColor('primary', 0.1),
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: this.getThemeColor('primary'),
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Variance Threshold Accuracy',
                        data: Array(data.ga.history.length).fill(data.varianceThreshold.accuracy),
                        borderColor: this.getThemeColor('secondary'),
                        backgroundColor: this.getThemeColor('secondary', 0.1),
                        borderWidth: 3,
                        borderDash: [5, 5],
                        fill: false,
                        pointBackgroundColor: this.getThemeColor('secondary'),
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'GA vs Variance Threshold Comparison',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.getThemeColor('text')
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: this.getThemeColor('text'),
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: this.getThemeColor('background'),
                        titleColor: this.getThemeColor('text'),
                        bodyColor: this.getThemeColor('text'),
                        borderColor: this.getThemeColor('border'),
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ${value.toFixed(4)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Generation',
                            color: this.getThemeColor('text')
                        },
                        grid: {
                            color: this.getThemeColor('grid'),
                            drawBorder: false
                        },
                        ticks: {
                            color: this.getThemeColor('text')
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Accuracy / Fitness',
                            color: this.getThemeColor('text')
                        },
                        grid: {
                            color: this.getThemeColor('grid'),
                            drawBorder: false
                        },
                        ticks: {
                            color: this.getThemeColor('text'),
                            callback: function(value) {
                                return value.toFixed(3);
                            }
                        },
                        beginAtZero: true,
                        max: 1
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    updateTheme(theme) {
        if (!this.currentChart) return;

        // Update chart colors based on theme
        const isDark = document.documentElement.classList.contains('dark');
        
        // Update chart options
        this.currentChart.options.plugins.title.color = isDark ? '#e5e7eb' : '#374151';
        this.currentChart.options.plugins.legend.labels.color = isDark ? '#e5e7eb' : '#374151';
        this.currentChart.options.scales.x.title.color = isDark ? '#e5e7eb' : '#374151';
        this.currentChart.options.scales.y.title.color = isDark ? '#e5e7eb' : '#374151';
        this.currentChart.options.scales.x.ticks.color = isDark ? '#e5e7eb' : '#374151';
        this.currentChart.options.scales.y.ticks.color = isDark ? '#e5e7eb' : '#374151';
        this.currentChart.options.scales.x.grid.color = isDark ? '#374151' : '#e5e7eb';
        this.currentChart.options.scales.y.grid.color = isDark ? '#374151' : '#e5e7eb';

        this.currentChart.update();
    }

    getThemeColor(colorType, alpha = 1) {
        const isDark = document.documentElement.classList.contains('dark');
        
        const colors = {
            light: {
                primary: `rgba(59, 130, 246, ${alpha})`,
                secondary: `rgba(239, 68, 68, ${alpha})`,
                success: `rgba(16, 185, 129, ${alpha})`,
                error: `rgba(239, 68, 68, ${alpha})`,
                warning: `rgba(245, 158, 11, ${alpha})`,
                text: '#374151',
                background: '#ffffff',
                border: '#e5e7eb',
                grid: '#e5e7eb'
            },
            dark: {
                primary: `rgba(96, 165, 250, ${alpha})`,
                secondary: `rgba(248, 113, 113, ${alpha})`,
                success: `rgba(52, 211, 153, ${alpha})`,
                error: `rgba(248, 113, 113, ${alpha})`,
                warning: `rgba(251, 191, 36, ${alpha})`,
                text: '#e5e7eb',
                background: '#1f2937',
                border: '#374151',
                grid: '#374151'
            }
        };

        return colors[isDark ? 'dark' : 'light'][colorType] || colors.light[colorType];
    }

    exportChart(format = 'png') {
        if (!this.currentChart) {
            this.app.showToast('No chart to export', 'warning');
            return;
        }

        const link = document.createElement('a');
        link.download = `ga-chart-${new Date().toISOString().split('T')[0]}.${format}`;
        link.href = this.currentChart.toBase64Image();
        link.click();
        
        this.app.showToast(`Chart exported as ${format.toUpperCase()}`, 'success');
    }

    resizeChart() {
        if (this.currentChart) {
            this.currentChart.resize();
        }
    }
}
