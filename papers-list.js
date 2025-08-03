// 试卷管理页面 - JavaScript 交互功能

// 全局变量
let currentPage = 1;
let pageSize = 10;
let totalCount = 0;
let currentSort = { field: 'created', order: 'desc' };
let currentFilters = {
    subject: '',
    status: '',
    startDate: '',
    endDate: '',
    search: ''
};
let selectedPapers = new Set();
let currentView = 'list';
let papersData = [];

// 模拟试卷数据
const mockPapers = [
    {
        id: 1,
        name: '高一数学月考试卷',
        description: '第一次月考，涵盖函数和三角函数',
        subject: 'math',
        questions: 25,
        totalScore: 150,
        created: '2025-01-15',
        lastUsed: '2025-01-20',
        usageCount: 15,
        status: 'published',
        difficulty: '中等',
        duration: 120
    },
    {
        id: 2,
        name: '英语写作专项练习',
        description: '重点训练议论文写作技巧',
        subject: 'english',
        questions: 12,
        totalScore: 100,
        created: '2025-01-10',
        lastUsed: '2025-01-18',
        usageCount: 8,
        status: 'published',
        difficulty: '困难',
        duration: 90
    },
    {
        id: 3,
        name: '函数图像专题',
        description: '一次函数、二次函数图像练习',
        subject: 'math',
        questions: 18,
        totalScore: 120,
        created: '2025-01-08',
        lastUsed: '2025-01-16',
        usageCount: 22,
        status: 'draft',
        difficulty: '简单',
        duration: 90
    },
    {
        id: 4,
        name: '英语阅读理解训练',
        description: '包含科技、文化、社会等多个主题',
        subject: 'english',
        questions: 20,
        totalScore: 80,
        created: '2025-01-05',
        lastUsed: '2025-01-12',
        usageCount: 31,
        status: 'published',
        difficulty: '中等',
        duration: 60
    },
    {
        id: 5,
        name: '三角函数综合测试',
        description: '正弦、余弦、正切函数的综合应用',
        subject: 'math',
        questions: 20,
        totalScore: 100,
        created: '2025-01-03',
        lastUsed: '2025-01-10',
        usageCount: 12,
        status: 'archived',
        difficulty: '困难',
        duration: 100
    }
];

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 初始化页面
function initializePage() {
    setupEventListeners();
    loadPapersData();
    setupResponsiveMenu();
    initializeFilters();
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索框
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 500));
    }

    // 筛选器
    document.getElementById('subjectFilter')?.addEventListener('change', handleFilterChange);
    document.getElementById('statusFilter')?.addEventListener('change', handleFilterChange);
    document.getElementById('startDate')?.addEventListener('change', handleFilterChange);
    document.getElementById('endDate')?.addEventListener('change', handleFilterChange);

    // 视图切换
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });

    // 全选复选框
    document.getElementById('selectAll')?.addEventListener('change', handleSelectAll);

    // 排序
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', handleSort);
    });

    // 页面大小选择
    document.getElementById('pageSize')?.addEventListener('change', changePageSize);

    // 模态框
    setupModalEvents();

    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 加载试卷数据
function loadPapersData() {
    showLoading(true);
    
    // 模拟API调用
    setTimeout(() => {
        papersData = [...mockPapers];
        totalCount = papersData.length;
        applyFiltersAndSort();
        renderPapers();
        updatePagination();
        showLoading(false);
    }, 500);
}

// 应用筛选和排序
function applyFiltersAndSort() {
    let filteredData = [...papersData];

    // 应用筛选
    if (currentFilters.subject) {
        filteredData = filteredData.filter(paper => paper.subject === currentFilters.subject);
    }
    
    if (currentFilters.status) {
        filteredData = filteredData.filter(paper => paper.status === currentFilters.status);
    }
    
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredData = filteredData.filter(paper => 
            paper.name.toLowerCase().includes(searchTerm) ||
            paper.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (currentFilters.startDate) {
        filteredData = filteredData.filter(paper => paper.created >= currentFilters.startDate);
    }
    
    if (currentFilters.endDate) {
        filteredData = filteredData.filter(paper => paper.created <= currentFilters.endDate);
    }

    // 应用排序
    filteredData.sort((a, b) => {
        let aValue = a[currentSort.field];
        let bValue = b[currentSort.field];
        
        if (currentSort.field === 'created' || currentSort.field === 'lastUsed') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (currentSort.order === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    totalCount = filteredData.length;
    
    // 分页
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    papersData = filteredData.slice(startIndex, endIndex);
}

// 渲染试卷列表
function renderPapers() {
    if (currentView === 'list') {
        renderTableView();
    } else {
        renderGridView();
    }
    
    updateSelectedCount();
    
    // 显示空状态
    const isEmpty = totalCount === 0;
    document.getElementById('emptyState').style.display = isEmpty ? 'block' : 'none';
    document.getElementById('tableView').style.display = isEmpty ? 'none' : 'block';
    document.getElementById('gridView').style.display = 'none';
    
    if (currentView === 'grid' && !isEmpty) {
        document.getElementById('tableView').style.display = 'none';
        document.getElementById('gridView').style.display = 'block';
    }
}

// 渲染表格视图
function renderTableView() {
    const tbody = document.getElementById('papersTableBody');
    if (!tbody) return;

    tbody.innerHTML = papersData.map(paper => `
        <tr class="${selectedPapers.has(paper.id) ? 'selected' : ''}" data-paper-id="${paper.id}">
            <td class="checkbox-col">
                <input type="checkbox" ${selectedPapers.has(paper.id) ? 'checked' : ''} 
                       onchange="togglePaperSelection(${paper.id})">
            </td>
            <td>
                <div class="paper-name">${paper.name}</div>
                <div class="paper-description">${paper.description}</div>
            </td>
            <td>
                <span class="subject-badge ${paper.subject}">
                    ${paper.subject === 'math' ? '数学' : '英语'}
                </span>
            </td>
            <td>
                <div class="questions-count">
                    <i class="fas fa-list-ol"></i>
                    ${paper.questions}题
                </div>
            </td>
            <td>
                <div class="score-display">${paper.totalScore}分</div>
            </td>
            <td>${formatDate(paper.created)}</td>
            <td>
                <div class="usage-count ${getUsageLevel(paper.usageCount)}">
                    ${paper.usageCount}次
                </div>
            </td>
            <td>
                <span class="status-badge ${paper.status}">
                    ${getStatusText(paper.status)}
                </span>
            </td>
            <td class="actions-col">
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editPaper(${paper.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn copy" onclick="copyPaper(${paper.id})" title="复制">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn preview" onclick="previewPaper(${paper.id})" title="预览">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="deletePaper(${paper.id})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 渲染网格视图
function renderGridView() {
    const grid = document.getElementById('papersGrid');
    if (!grid) return;

    grid.innerHTML = papersData.map(paper => `
        <div class="paper-card ${selectedPapers.has(paper.id) ? 'selected' : ''}" 
             data-paper-id="${paper.id}" onclick="selectPaperCard(${paper.id})">
            <input type="checkbox" class="card-checkbox" ${selectedPapers.has(paper.id) ? 'checked' : ''} 
                   onchange="togglePaperSelection(${paper.id})" onclick="event.stopPropagation()">
            
            <div class="paper-card-header">
                <div>
                    <div class="paper-card-title">${paper.name}</div>
                    <span class="subject-badge ${paper.subject}">
                        ${paper.subject === 'math' ? '数学' : '英语'}
                    </span>
                </div>
                <span class="status-badge ${paper.status}">
                    ${getStatusText(paper.status)}
                </span>
            </div>
            
            <div class="paper-card-meta">
                <div>${paper.description}</div>
            </div>
            
            <div class="paper-card-stats">
                <div class="stat-item-card">
                    <span class="value">${paper.questions}</span>
                    <span class="label">题目</span>
                </div>
                <div class="stat-item-card">
                    <span class="value">${paper.totalScore}</span>
                    <span class="label">总分</span>
                </div>
                <div class="stat-item-card">
                    <span class="value">${paper.usageCount}</span>
                    <span class="label">使用次数</span>
                </div>
                <div class="stat-item-card">
                    <span class="value">${paper.duration}</span>
                    <span class="label">分钟</span>
                </div>
            </div>
            
            <div class="paper-card-actions">
                <small>创建于 ${formatDate(paper.created)}</small>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editPaper(${paper.id}); event.stopPropagation();" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn copy" onclick="copyPaper(${paper.id}); event.stopPropagation();" title="复制">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn preview" onclick="previewPaper(${paper.id}); event.stopPropagation();" title="预览">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="deletePaper(${paper.id}); event.stopPropagation();" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 工具函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function getUsageLevel(count) {
    if (count >= 20) return 'high';
    if (count >= 10) return 'medium';
    return 'low';
}

function getStatusText(status) {
    const statusMap = {
        'draft': '草稿',
        'published': '已发布',
        'archived': '已归档'
    };
    return statusMap[status] || status;
}

// 事件处理函数
function handleSearch(event) {
    currentFilters.search = event.target.value;
    currentPage = 1;
    applyFiltersAndSort();
    renderPapers();
    updatePagination();
}

function handleFilterChange(event) {
    const filterId = event.target.id;
    const value = event.target.value;
    
    switch(filterId) {
        case 'subjectFilter':
            currentFilters.subject = value;
            break;
        case 'statusFilter':
            currentFilters.status = value;
            break;
        case 'startDate':
            currentFilters.startDate = value;
            break;
        case 'endDate':
            currentFilters.endDate = value;
            break;
    }
    
    currentPage = 1;
    applyFiltersAndSort();
    renderPapers();
    updatePagination();
}

function handleViewChange(event) {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.view-btn').classList.add('active');
    
    currentView = event.target.closest('.view-btn').dataset.view;
    renderPapers();
}

function handleSort(event) {
    const field = event.currentTarget.dataset.sort;
    
    if (currentSort.field === field) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.order = 'asc';
    }
    
    // 更新排序图标
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('asc', 'desc');
    });
    event.currentTarget.classList.add(currentSort.order);
    
    applyFiltersAndSort();
    renderPapers();
    updatePagination();
}

function handleSelectAll(event) {
    const isChecked = event.target.checked;
    
    if (isChecked) {
        papersData.forEach(paper => selectedPapers.add(paper.id));
    } else {
        selectedPapers.clear();
    }
    
    renderPapers();
    updateBulkActions();
}

function togglePaperSelection(paperId) {
    if (selectedPapers.has(paperId)) {
        selectedPapers.delete(paperId);
    } else {
        selectedPapers.add(paperId);
    }
    
    updateSelectedCount();
    updateBulkActions();
    
    // 更新全选复选框状态
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.indeterminate = selectedPapers.size > 0 && selectedPapers.size < papersData.length;
        selectAllCheckbox.checked = selectedPapers.size === papersData.length && papersData.length > 0;
    }
}

function selectPaperCard(paperId) {
    togglePaperSelection(paperId);
    renderPapers();
}

function updateSelectedCount() {
    const selectedCount = document.getElementById('selectedCount');
    if (selectedCount) {
        selectedCount.textContent = selectedPapers.size;
    }
}

function updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    if (bulkActions) {
        bulkActions.style.display = selectedPapers.size > 0 ? 'flex' : 'none';
    }
}

// 分页相关函数
function updatePagination() {
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // 更新分页信息
    document.getElementById('currentStart').textContent = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    document.getElementById('currentEnd').textContent = Math.min(currentPage * pageSize, totalCount);
    document.getElementById('totalCount').textContent = totalCount;
    
    // 更新分页按钮状态
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
    
    // 生成页码
    generatePageNumbers(totalPages);
}

function generatePageNumbers(totalPages) {
    const pageNumbers = document.getElementById('pageNumbers');
    if (!pageNumbers) return;
    
    let html = '';
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        html += `<button class="page-number" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="page-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="page-ellipsis">...</span>`;
        }
        html += `<button class="page-number" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
    
    pageNumbers.innerHTML = html;
}

function changePage(direction) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        applyFiltersAndSort();
        renderPapers();
        updatePagination();
    }
}

function goToPage(page) {
    currentPage = page;
    applyFiltersAndSort();
    renderPapers();
    updatePagination();
}

function changePageSize() {
    pageSize = parseInt(document.getElementById('pageSize').value);
    currentPage = 1;
    applyFiltersAndSort();
    renderPapers();
    updatePagination();
}

// 试卷操作函数
function createNewPaper() {
    showActionFeedback('正在跳转到试卷创建页面...', 'info');
    setTimeout(() => {
        window.location.href = '/papers/create';
    }, 1000);
}

function editPaper(paperId) {
    showActionFeedback('正在跳转到试卷编辑页面...', 'info');
    setTimeout(() => {
        window.location.href = `/papers/edit/${paperId}`;
    }, 1000);
}

function copyPaper(paperId) {
    const paper = mockPapers.find(p => p.id === paperId);
    if (paper) {
        showActionFeedback(`已复制试卷：${paper.name}`, 'success');
        // 这里可以实现复制逻辑
    }
}

function previewPaper(paperId) {
    showActionFeedback('正在跳转到试卷预览页面...', 'info');
    setTimeout(() => {
        window.location.href = `/papers/preview/${paperId}`;
    }, 1000);
}

function deletePaper(paperId) {
    const paper = mockPapers.find(p => p.id === paperId);
    if (paper) {
        showDeleteModal([paper]);
    }
}

// 批量操作函数
function bulkExport() {
    if (selectedPapers.size === 0) return;
    
    showActionFeedback(`正在导出 ${selectedPapers.size} 份试卷...`, 'info');
    setTimeout(() => {
        showActionFeedback('试卷导出完成', 'success');
    }, 2000);
}

function bulkArchive() {
    if (selectedPapers.size === 0) return;
    
    showActionFeedback(`正在归档 ${selectedPapers.size} 份试卷...`, 'info');
    setTimeout(() => {
        selectedPapers.clear();
        updateBulkActions();
        renderPapers();
        showActionFeedback('试卷归档完成', 'success');
    }, 1500);
}

function bulkDelete() {
    if (selectedPapers.size === 0) return;
    
    const selectedPapersList = mockPapers.filter(p => selectedPapers.has(p.id));
    showDeleteModal(selectedPapersList);
}

function importPapers() {
    showActionFeedback('试卷导入功能开发中...', 'info');
}

function exportTemplates() {
    showActionFeedback('正在导出试卷模板...', 'info');
    setTimeout(() => {
        showActionFeedback('模板导出完成', 'success');
    }, 1500);
}

function importTemplate() {
    showActionFeedback('模板导入功能开发中...', 'info');
}

// 筛选相关函数
function resetFilters() {
    currentFilters = {
        subject: '',
        status: '',
        startDate: '',
        endDate: '',
        search: ''
    };
    
    // 重置表单
    document.getElementById('subjectFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('searchInput').value = '';
    
    currentPage = 1;
    applyFiltersAndSort();
    renderPapers();
    updatePagination();
    
    showActionFeedback('筛选条件已重置', 'success');
}

function initializeFilters() {
    // 设置默认日期范围（最近一个月）
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    // 不设置开始日期，显示所有数据
}

// 模态框相关函数
function setupModalEvents() {
    // 点击模态框外部关闭
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal();
            closeDeleteModal();
        }
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
            closeDeleteModal();
        }
    });
}

function showDeleteModal(papers) {
    const modal = document.getElementById('deleteModal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="delete-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <p>确定要删除以下试卷吗？此操作不可撤销。</p>
            <ul style="text-align: left; margin-top: 16px; padding-left: 20px;">
                ${papers.map(paper => `<li>${paper.name}</li>`).join('')}
            </ul>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // 存储要删除的试卷ID
    modal.dataset.deleteIds = papers.map(p => p.id).join(',');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

function confirmDelete() {
    const modal = document.getElementById('deleteModal');
    const deleteIds = modal.dataset.deleteIds.split(',').map(id => parseInt(id));
    
    showActionFeedback(`正在删除 ${deleteIds.length} 份试卷...`, 'info');
    
    setTimeout(() => {
        // 从选中集合中移除
        deleteIds.forEach(id => selectedPapers.delete(id));
        
        // 重新加载数据
        loadPapersData();
        
        closeDeleteModal();
        updateBulkActions();
        showActionFeedback('试卷删除成功', 'success');
    }, 1500);
}

function closeModal() {
    document.getElementById('paperModal').style.display = 'none';
}

// 响应式菜单
function setupResponsiveMenu() {
    if (window.innerWidth <= 968) {
        createMobileMenuToggle();
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 968) {
            createMobileMenuToggle();
        } else {
            removeMobileMenuToggle();
            closeSidebar();
        }
    });
}

function createMobileMenuToggle() {
    const navbar = document.querySelector('.top-navbar');
    const existingToggle = document.querySelector('.sidebar-toggle');
    
    if (existingToggle) return;
    
    const toggle = document.createElement('button');
    toggle.className = 'sidebar-toggle';
    toggle.innerHTML = '<i class="fas fa-bars"></i>';
    toggle.onclick = toggleSidebar;
    
    navbar.insertBefore(toggle, navbar.querySelector('.main-nav'));
    
    // 添加切换按钮样式
    const style = document.createElement('style');
    style.textContent = `
        .sidebar-toggle {
            display: none;
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            padding: 8px;
            cursor: pointer;
            border-radius: 4px;
            transition: background 0.3s ease;
        }
        .sidebar-toggle:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        @media (max-width: 968px) {
            .sidebar-toggle {
                display: block;
            }
        }
    `;
    
    if (!document.querySelector('style[data-sidebar-toggle="true"]')) {
        style.setAttribute('data-sidebar-toggle', 'true');
        document.head.appendChild(style);
    }
}

function removeMobileMenuToggle() {
    const toggle = document.querySelector('.sidebar-toggle');
    if (toggle) {
        toggle.remove();
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('open');
}

// 键盘快捷键
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + N: 创建新试卷
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        createNewPaper();
    }
    
    // Ctrl/Cmd + F: 聚焦搜索框
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        document.getElementById('searchInput')?.focus();
    }
    
    // Delete: 删除选中的试卷
    if (event.key === 'Delete' && selectedPapers.size > 0) {
        event.preventDefault();
        bulkDelete();
    }
    
    // Ctrl/Cmd + A: 全选
    if ((event.ctrlKey || event.metaKey) && event.key === 'a' && event.target.tagName !== 'INPUT') {
        event.preventDefault();
        document.getElementById('selectAll').checked = true;
        handleSelectAll({ target: { checked: true } });
    }
}

// Loading 显示/隐藏
function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// 操作反馈函数
function showActionFeedback(message, type = 'success') {
    const feedback = document.createElement('div');
    feedback.className = `action-feedback ${type}`;
    feedback.textContent = message;
    
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
    
    setTimeout(() => {
        feedback.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            feedback.remove();
        }, 300);
    }, 3000);
}

console.log('试卷管理页面已加载完成');