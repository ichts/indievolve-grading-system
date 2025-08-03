// AI智能阅卷系统 - 工作台首页交互功能

// 全局变量
let charts = {};
let userData = {
    pendingGrading: 245,
    completedThisMonth: 1234,
    classAverage: 82.5,
    totalStudents: 156
};

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 初始化页面
function initializePage() {
    initializeCharts();
    setupEventListeners();
    loadRecentData();
    startRealTimeUpdates();
}

// 初始化图表
function initializeCharts() {
    initScoreDistributionChart();
    initSubjectComparisonChart();
    initMonthlyTrendChart();
}

// 成绩分布图表
function initScoreDistributionChart() {
    const ctx = document.getElementById('scoreDistributionChart');
    if (!ctx) return;
    
    charts.scoreDistribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['0-59', '60-69', '70-79', '80-89', '90-100'],
            datasets: [{
                label: '学生人数',
                data: [8, 15, 45, 62, 26],
                backgroundColor: [
                    '#e74c3c',
                    '#f39c12',
                    '#f1c40f',
                    '#2ecc71',
                    '#27ae60'
                ],
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} 人 (${(context.parsed.y/156*100).toFixed(1)}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 10
                    },
                    grid: {
                        color: '#f8f9fa'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// 学科对比雷达图
function initSubjectComparisonChart() {
    const ctx = document.getElementById('subjectComparisonChart');
    if (!ctx) return;

    charts.subjectComparison = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['基础知识', '解题能力', '应用能力', '创新思维', '学习态度'],
            datasets: [{
                label: '数学',
                data: [85, 78, 82, 75, 88],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: '#667eea',
                borderWidth: 2,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointRadius: 4
            }, {
                label: '英语',
                data: [82, 85, 79, 83, 86],
                backgroundColor: 'rgba(118, 75, 162, 0.2)',
                borderColor: '#764ba2',
                borderWidth: 2,
                pointBackgroundColor: '#764ba2',
                pointBorderColor: '#fff', 
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        display: false
                    },
                    grid: {
                        color: '#f0f0f0'
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// 月度趋势图
function initMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart');
    if (!ctx) return;

    charts.monthlyTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['9月', '10月', '11月', '12月', '1月', '2月'],
            datasets: [{
                label: '数学',
                data: [78, 82, 79, 85, 83, 87],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }, {
                label: '英语',
                data: [75, 78, 81, 79, 82, 84],
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}分`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 70,
                    max: 90,
                    ticks: {
                        stepSize: 5
                    },
                    grid: {
                        color: '#f8f9fa'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 用户档案下拉菜单
    setupUserProfileDropdown();
    
    // 通知铃铛点击
    setupNotificationBell();
    
    // 图表筛选器
    setupChartFilters();
    
    // 快捷操作卡片点击效果
    setupActionCardEffects();
    
    // 响应式导航菜单
    setupResponsiveNavigation();
}

// 用户档案下拉菜单
function setupUserProfileDropdown() {
    const userProfile = document.querySelector('.user-profile');
    if (!userProfile) return;

    userProfile.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleUserDropdown();
    });

    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', function() {
        closeUserDropdown();
    });
}

function toggleUserDropdown() {
    // 创建下拉菜单（如果不存在）
    let dropdown = document.querySelector('.user-dropdown');
    if (!dropdown) {
        dropdown = createUserDropdown();
        document.querySelector('.user-profile').appendChild(dropdown);
    }
    
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function createUserDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML = `
        <div class="dropdown-item" onclick="editProfile()">
            <i class="fas fa-user"></i>
            <span>个人资料</span>
        </div>
        <div class="dropdown-item" onclick="changePassword()">
            <i class="fas fa-key"></i>
            <span>修改密码</span>
        </div>
        <div class="dropdown-item" onclick="viewSettings()">
            <i class="fas fa-cog"></i>
            <span>系统设置</span>
        </div>
        <hr class="dropdown-divider">
        <div class="dropdown-item" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>退出登录</span>
        </div>
    `;
    
    // 添加下拉菜单样式
    const style = document.createElement('style');
    style.textContent = `
        .user-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            min-width: 180px;
            padding: 8px 0;
            display: none;
            z-index: 1000;
        }
        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            cursor: pointer;
            color: #2c3e50;
            transition: background 0.2s ease;
        }
        .dropdown-item:hover {
            background: #f8f9fa;
        }
        .dropdown-divider {
            margin: 8px 0;
            border: none;
            height: 1px;
            background: #ecf0f1;
        }
    `;
    document.head.appendChild(style);
    
    return dropdown;
}

function closeUserDropdown() {
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// 通知铃铛功能
function setupNotificationBell() {
    const notificationBell = document.querySelector('.notification-bell');
    if (!notificationBell) return;

    notificationBell.addEventListener('click', function() {
        showNotificationPanel();
    });
}

function showNotificationPanel() {
    // 简单的通知面板示例
    alert('通知功能：\n- 数学月考阅卷完成\n- 英语作文批改中\n- 系统维护通知');
}

// 图表筛选器
function setupChartFilters() {
    const chartFilters = document.querySelectorAll('.chart-filter');
    chartFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            updateChartData(this.value);
        });
    });
}

function updateChartData(timeRange) {
    // 根据时间范围更新图表数据
    let newData;
    switch(timeRange) {
        case '本月数据':
            newData = [8, 15, 45, 62, 26];
            break;
        case '本学期':
            newData = [12, 28, 89, 156, 67];
            break;
        case '本学年':
            newData = [25, 54, 178, 312, 134];
            break;
        default:
            newData = [8, 15, 45, 62, 26];
    }
    
    if (charts.scoreDistribution) {
        charts.scoreDistribution.data.datasets[0].data = newData;
        charts.scoreDistribution.update();
    }
}

// 快捷操作卡片效果
function setupActionCardEffects() {
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-4px)';
        });
    });
}

// 响应式导航菜单
function setupResponsiveNavigation() {
    // 检查屏幕尺寸，如果是移动端，添加汉堡菜单
    if (window.innerWidth <= 768) {
        createMobileMenu();
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            createMobileMenu();
        } else {
            removeMobileMenu();
        }
    });
}

function createMobileMenu() {
    const navbar = document.querySelector('.top-navbar');
    const existingMenu = document.querySelector('.mobile-menu-toggle');
    
    if (existingMenu) return;
    
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.onclick = toggleMobileMenu;
    
    navbar.insertBefore(menuToggle, navbar.querySelector('.navbar-right'));
}

function removeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.remove();
    }
}

function toggleMobileMenu() {
    const mainNav = document.querySelector('.main-nav');
    mainNav.style.display = mainNav.style.display === 'flex' ? 'none' : 'flex';
}

// 加载最新数据
function loadRecentData() {
    // 模拟从API加载数据
    updateStatCards();
    updateRecentActivities();
    updateNotifications();
}

function updateStatCards() {
    // 更新统计卡片数据
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
        animateCounter(statNumbers[0], userData.pendingGrading);
        animateCounter(statNumbers[1], userData.completedThisMonth);
        animateCounter(statNumbers[2], userData.classAverage, true);
        animateCounter(statNumbers[3], userData.totalStudents);
    }
}

function animateCounter(element, targetValue, isDecimal = false) {
    const startValue = 0;
    const duration = 1500;
    const stepTime = 50;
    const steps = duration / stepTime;
    const stepValue = (targetValue - startValue) / steps;
    let currentValue = startValue;
    
    const timer = setInterval(() => {
        currentValue += stepValue;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        
        element.textContent = isDecimal ? 
            currentValue.toFixed(1) : 
            Math.floor(currentValue).toLocaleString();
    }, stepTime);
}

function updateRecentActivities() {
    // 这里可以通过API获取最新活动数据
    console.log('更新近期动态数据');
}

function updateNotifications() {
    // 更新通知数量
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
        // 模拟通知数量变化
        setTimeout(() => {
            notificationBadge.textContent = '5';
            notificationBadge.style.animation = 'pulse 0.5s ease-in-out';
        }, 3000);
    }
}

// 实时更新功能
function startRealTimeUpdates() {
    // 每30秒更新一次数据
    setInterval(() => {
        loadRecentData();
        updateProgressBars();
    }, 30000);
    
    // 每5秒更新进度条
    setInterval(updateProgressBars, 5000);
}

function updateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const currentWidth = parseInt(bar.style.width) || 35;
        const newWidth = Math.min(currentWidth + Math.random() * 2, 100);
        bar.style.width = newWidth + '%';
        
        const progressText = bar.parentElement.nextElementSibling;
        if (progressText) {
            progressText.textContent = `已完成 ${Math.floor(newWidth)}%`;
        }
    });
}

// 快捷操作函数
function createNewPaper() {
    showActionFeedback('正在跳转到试卷创建页面...', 'info');
    setTimeout(() => {
        window.location.href = '/papers/create';
    }, 1000);
}

function uploadAnswers() {
    showActionFeedback('正在跳转到答卷上传页面...', 'info');
    setTimeout(() => {
        window.location.href = '/grading/upload';
    }, 1000);
}

function viewReports() {
    showActionFeedback('正在跳转到学情分析页面...', 'info');
    setTimeout(() => {
        window.location.href = '/analysis/dashboard';
    }, 1000);
}

function manageClasses() {
    showActionFeedback('正在跳转到班级管理页面...', 'info');
    setTimeout(() => {
        window.location.href = '/classes/list';
    }, 1000);
}

// 用户操作函数
function editProfile() {
    closeUserDropdown();
    showActionFeedback('正在跳转到个人资料页面...', 'info');
    setTimeout(() => {
        window.location.href = '/settings/profile';
    }, 1000);
}

function changePassword() {
    closeUserDropdown();
    showActionFeedback('正在跳转到密码修改页面...', 'info');
}

function viewSettings() {
    closeUserDropdown();
    showActionFeedback('正在跳转到系统设置页面...', 'info');
    setTimeout(() => {
        window.location.href = '/settings/system';
    }, 1000);
}

function logout() {
    closeUserDropdown();
    if (confirm('确定要退出登录吗？')) {
        showActionFeedback('正在退出登录...', 'info');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    }
}

// 操作反馈函数
function showActionFeedback(message, type = 'success') {
    // 创建反馈提示
    const feedback = document.createElement('div');
    feedback.className = `action-feedback ${type}`;
    feedback.textContent = message;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .action-feedback {
            position: fixed;
            top: 80px;
            right: 24px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        }
        .action-feedback.success {
            background: #27ae60;
        }
        .action-feedback.info {
            background: #3498db;
        }
        .action-feedback.warning {
            background: #f39c12;
        }
        .action-feedback.error {
            background: #e74c3c;
        }
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    if (!document.querySelector('style[data-feedback="true"]')) {
        style.setAttribute('data-feedback', 'true');
        document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    // 3秒后自动移除
    setTimeout(() => {
        feedback.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            feedback.remove();
        }, 300);
    }, 3000);
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
    showActionFeedback('页面出现错误，请刷新重试', 'error');
});

// 网络状态监测
window.addEventListener('online', function() {
    showActionFeedback('网络连接已恢复', 'success');
});

window.addEventListener('offline', function() {
    showActionFeedback('网络连接已断开', 'warning');
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时刷新数据
        loadRecentData();
    }
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N: 创建新试卷
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewPaper();
    }
    
    // Ctrl/Cmd + U: 上传答卷
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        uploadAnswers();
    }
    
    // ESC: 关闭下拉菜单
    if (e.key === 'Escape') {
        closeUserDropdown();
    }
});

console.log('AI智能阅卷系统工作台已加载完成');