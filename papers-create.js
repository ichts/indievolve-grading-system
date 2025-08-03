// 试卷创建页面 - JavaScript 交互功能

// 全局变量
let currentStep = 1;
let paperData = {
    name: '',
    subject: '',
    duration: 120,
    totalScore: 0,
    difficulty: 'medium',
    tags: '',
    description: '',
    questions: [],
    scoringRules: {
        strictness: 'normal',
        reviewThreshold: 70,
        mathRules: [],
        englishRules: []
    }
};

let questionCounter = 0;
let selectedQuestions = new Set();
let sortableInstance = null;
let isAutoSaving = false;
let saveTimer = null;

// 题目类型配置
const questionTypes = {
    choice: { name: '单选题', icon: 'fa-dot-circle', defaultScore: 4 },
    multiple: { name: '多选题', icon: 'fa-check-square', defaultScore: 5 },
    fill: { name: '填空题', icon: 'fa-edit', defaultScore: 6 },
    short: { name: '简答题', icon: 'fa-align-left', defaultScore: 10 },
    essay: { name: '解答题', icon: 'fa-file-text', defaultScore: 15 },
    composition: { name: '作文题', icon: 'fa-pen-fancy', defaultScore: 25 }
};

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 初始化页面
function initializePage() {
    setupEventListeners();
    setupFormValidation();
    setupAutoSave();
    initializeSortable();
    loadFromStorage();
    updatePreview();
}

// 设置事件监听器
function setupEventListeners() {
    // 基本信息表单
    document.getElementById('paperName')?.addEventListener('input', handleBasicInfoChange);
    document.getElementById('subject')?.addEventListener('change', handleSubjectChange);
    document.getElementById('duration')?.addEventListener('input', handleBasicInfoChange);
    document.getElementById('difficulty')?.addEventListener('change', handleBasicInfoChange);
    document.getElementById('tags')?.addEventListener('input', handleBasicInfoChange);
    document.getElementById('description')?.addEventListener('input', handleBasicInfoChange);

    // 评分设置
    document.getElementById('reviewThreshold')?.addEventListener('input', updateThresholdValue);
    document.querySelectorAll('input[name="strictness"]').forEach(radio => {
        radio.addEventListener('change', handleScoringRuleChange);
    });

    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // 页面离开提醒
    window.addEventListener('beforeunload', handlePageLeave);
}

// 处理基本信息变化
function handleBasicInfoChange(event) {
    const field = event.target.id;
    const value = event.target.value;
    
    paperData[field] = value;
    
    if (field === 'paperName') {
        paperData.name = value;
    }
    
    updatePreview();
    scheduleAutoSave();
    validateForm();
}

// 处理学科变化
function handleSubjectChange() {
    const subject = document.getElementById('subject').value;
    paperData.subject = subject;
    
    // 显示/隐藏对应的评分规则
    document.getElementById('mathScoringSection').style.display = subject === 'math' ? 'block' : 'none';
    document.getElementById('englishScoringSection').style.display = subject === 'english' ? 'block' : 'none';
    
    // 更新题目类型选项
    updateQuestionTypeOptions(subject);
    
    updatePreview();
    scheduleAutoSave();
}

// 更新题目类型选项
function updateQuestionTypeOptions(subject) {
    const questionTypeSelect = document.getElementById('questionType');
    if (!questionTypeSelect) return;
    
    // 保留第一个选项
    const firstOption = questionTypeSelect.firstElementChild;
    questionTypeSelect.innerHTML = '';
    questionTypeSelect.appendChild(firstOption);
    
    // 根据学科添加适合的题型
    if (subject === 'math') {
        questionTypeSelect.innerHTML += `
            <option value="choice">单选题</option>
            <option value="multiple">多选题</option>
            <option value="fill">填空题</option>
            <option value="short">简答题</option>
            <option value="essay">解答题</option>
        `;
    } else if (subject === 'english') {
        questionTypeSelect.innerHTML += `
            <option value="choice">单选题</option>
            <option value="multiple">多选题</option>
            <option value="fill">填空题</option>
            <option value="short">简答题</option>
            <option value="composition">作文题</option>
        `;
    } else {
        // 默认显示所有题型
        Object.entries(questionTypes).forEach(([key, type]) => {
            questionTypeSelect.innerHTML += `<option value="${key}">${type.name}</option>`;
        });
    }
}

// 添加题目
function addQuestion() {
    const questionType = document.getElementById('questionType').value;
    if (!questionType) {
        showActionFeedback('请先选择题目类型', 'warning');
        return;
    }
    
    const question = {
        id: ++questionCounter,
        type: questionType,
        title: '',
        content: '',
        score: questionTypes[questionType].defaultScore,
        options: questionType === 'choice' || questionType === 'multiple' ? ['', '', '', ''] : [],
        correctAnswers: [],
        explanation: '',
        difficulty: 'medium'
    };
    
    paperData.questions.push(question);
    renderQuestionsList();
    updateTotalScore();
    updatePreview();
    scheduleAutoSave();
    
    // 自动打开编辑模态框
    editQuestion(question.id);
    
    showActionFeedback('题目已添加，请完善题目内容', 'success');
}

// 渲染题目列表
function renderQuestionsList() {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;
    
    if (paperData.questions.length === 0) {
        questionsList.innerHTML = `
            <div class="empty-questions">
                <div class="empty-icon">
                    <i class="fas fa-plus-circle"></i>
                </div>
                <h3>还没有添加题目</h3>
                <p>选择题目类型并点击"添加题目"开始创建</p>
            </div>
        `;
        document.getElementById('batchOperations').style.display = 'none';
        return;
    }
    
    const questionsHtml = paperData.questions.map((question, index) => {
        const typeInfo = questionTypes[question.type];
        const isSelected = selectedQuestions.has(question.id);
        
        return `
            <div class="question-item ${isSelected ? 'selected' : ''}" data-question-id="${question.id}">
                <input type="checkbox" class="question-checkbox" ${isSelected ? 'checked' : ''} 
                       onchange="toggleQuestionSelection(${question.id})">
                
                <div class="question-header">
                    <div class="question-info">
                        <div class="question-title">
                            <span class="question-number">${index + 1}</span>
                            <span class="question-type-badge">
                                <i class="fas ${typeInfo.icon}"></i>
                                ${typeInfo.name}
                            </span>
                            <button class="drag-handle" title="拖拽排序">
                                <i class="fas fa-grip-vertical"></i>
                            </button>
                        </div>
                        <div class="question-content">${question.content || '题目内容待完善...'}</div>
                        <div class="question-meta">
                            <span><i class="fas fa-calculator"></i> ${question.score}分</span>
                            <span><i class="fas fa-signal"></i> ${getDifficultyText(question.difficulty)}</span>
                            ${question.options.length > 0 ? `<span><i class="fas fa-list"></i> ${question.options.length}个选项</span>` : ''}
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn-icon edit" onclick="editQuestion(${question.id})" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon copy" onclick="copyQuestion(${question.id})" title="复制">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteQuestion(${question.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    questionsList.innerHTML = questionsHtml;
    
    // 显示批量操作栏
    document.getElementById('batchOperations').style.display = 'flex';
    
    // 更新题目计数
    document.getElementById('questionCount').textContent = paperData.questions.length;
    
    // 重新初始化拖拽排序
    initializeSortable();
}

// 获取难度文本
function getDifficultyText(difficulty) {
    const difficultyMap = {
        easy: '简单',
        medium: '中等',
        hard: '困难'
    };
    return difficultyMap[difficulty] || '中等';
}

// 初始化拖拽排序
function initializeSortable() {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList || paperData.questions.length === 0) return;
    
    if (sortableInstance) {
        sortableInstance.destroy();
    }
    
    sortableInstance = new Sortable(questionsList, {
        handle: '.drag-handle',
        animation: 200,
        ghostClass: 'sortable-ghost',
        onEnd: function(evt) {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            
            if (oldIndex !== newIndex) {
                // 更新数据数组
                const movedQuestion = paperData.questions.splice(oldIndex, 1)[0];
                paperData.questions.splice(newIndex, 0, movedQuestion);
                
                // 重新渲染
                renderQuestionsList();
                updatePreview();
                scheduleAutoSave();
                
                showActionFeedback('题目顺序已调整', 'success');
            }
        }
    });
}

// 编辑题目
function editQuestion(questionId) {
    const question = paperData.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const modal = document.getElementById('questionModal');
    const modalTitle = document.getElementById('questionModalTitle');
    const modalBody = document.getElementById('questionModalBody');
    
    modalTitle.textContent = question.content ? '编辑题目' : '添加题目';
    
    // 生成编辑表单
    modalBody.innerHTML = generateQuestionForm(question);
    
    // 显示模态框
    modal.style.display = 'block';
    
    // 存储当前编辑的题目ID
    modal.dataset.questionId = questionId;
    
    // 聚焦到题目内容输入框
    setTimeout(() => {
        const contentInput = modal.querySelector('#questionContentInput');
        if (contentInput) contentInput.focus();
    }, 100);
}

// 生成题目编辑表单
function generateQuestionForm(question) {
    const typeInfo = questionTypes[question.type];
    
    let formHtml = `
        <div class="question-form">
            <div class="question-form-section">
                <h4>基本信息</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="questionContentInput" class="required">题目内容</label>
                        <textarea id="questionContentInput" class="form-textarea" rows="3" 
                                placeholder="请输入题目内容">${question.content}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="questionScoreInput">分值</label>
                        <input type="number" id="questionScoreInput" class="form-input" 
                               value="${question.score}" min="1" max="50">
                    </div>
                    <div class="form-group">
                        <label for="questionDifficultyInput">难度</label>
                        <select id="questionDifficultyInput" class="form-select">
                            <option value="easy" ${question.difficulty === 'easy' ? 'selected' : ''}>简单</option>
                            <option value="medium" ${question.difficulty === 'medium' ? 'selected' : ''}>中等</option>
                            <option value="hard" ${question.difficulty === 'hard' ? 'selected' : ''}>困难</option>
                        </select>
                    </div>
                </div>
            </div>
    `;
    
    // 如果是选择题，添加选项编辑
    if (question.type === 'choice' || question.type === 'multiple') {
        formHtml += `
            <div class="question-form-section">
                <h4>选项设置</h4>
                <div class="options-list" id="optionsList">
        `;
        
        question.options.forEach((option, index) => {
            const isCorrect = question.correctAnswers.includes(index);
            const inputType = question.type === 'choice' ? 'radio' : 'checkbox';
            
            formHtml += `
                <div class="option-item">
                    <input type="${inputType}" name="correctAnswer" value="${index}" 
                           ${isCorrect ? 'checked' : ''}>
                    <span>${String.fromCharCode(65 + index)}.</span>
                    <input type="text" class="form-input" placeholder="选项内容" 
                           value="${option}" onchange="updateOption(${index}, this.value)">
                    <button type="button" class="btn-icon delete" onclick="removeOption(${index})" 
                            title="删除选项">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        
        formHtml += `
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="addOption()">
                    <i class="fas fa-plus"></i>
                    添加选项
                </button>
            </div>
        `;
    }
    
    // 添加解析
    formHtml += `
            <div class="question-form-section">
                <h4>题目解析（可选）</h4>
                <div class="form-group">
                    <textarea id="questionExplanationInput" class="form-textarea" rows="2" 
                            placeholder="请输入题目解析，帮助学生理解">${question.explanation}</textarea>
                </div>
            </div>
        </div>
    `;
    
    return formHtml;
}

// 保存题目
function saveQuestion() {
    const modal = document.getElementById('questionModal');
    const questionId = parseInt(modal.dataset.questionId);
    const question = paperData.questions.find(q => q.id === questionId);
    
    if (!question) return;
    
    // 获取表单数据
    const content = document.getElementById('questionContentInput').value.trim();
    const score = parseInt(document.getElementById('questionScoreInput').value) || 0;
    const difficulty = document.getElementById('questionDifficultyInput').value;
    const explanation = document.getElementById('questionExplanationInput')?.value || '';
    
    // 验证必填字段
    if (!content) {
        showActionFeedback('请填写题目内容', 'error');
        return;
    }
    
    if (score <= 0) {
        showActionFeedback('分值必须大于0', 'error');
        return;
    }
    
    // 更新题目数据
    question.content = content;
    question.score = score;
    question.difficulty = difficulty;
    question.explanation = explanation;
    
    // 如果是选择题，更新选项和答案
    if (question.type === 'choice' || question.type === 'multiple') {
        const optionInputs = modal.querySelectorAll('.option-item .form-input');
        question.options = Array.from(optionInputs).map(input => input.value.trim());
        
        const correctInputs = modal.querySelectorAll('input[name="correctAnswer"]:checked');
        question.correctAnswers = Array.from(correctInputs).map(input => parseInt(input.value));
        
        // 验证选择题必须有正确答案
        if (question.correctAnswers.length === 0) {
            showActionFeedback('请至少选择一个正确答案', 'error');
            return;
        }
    }
    
    // 关闭模态框
    closeQuestionModal();
    
    // 重新渲染列表
    renderQuestionsList();
    updateTotalScore();
    updatePreview();
    scheduleAutoSave();
    
    showActionFeedback('题目保存成功', 'success');
}

// 关闭题目编辑模态框
function closeQuestionModal() {
    document.getElementById('questionModal').style.display = 'none';
}

// 复制题目
function copyQuestion(questionId) {
    const question = paperData.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const newQuestion = {
        ...question,
        id: ++questionCounter,
        content: question.content + ' - 副本'
    };
    
    paperData.questions.push(newQuestion);
    renderQuestionsList();
    updateTotalScore();
    updatePreview();
    scheduleAutoSave();
    
    showActionFeedback('题目已复制', 'success');
}

// 删除题目
function deleteQuestion(questionId) {
    if (!confirm('确定要删除这道题目吗？')) return;
    
    const index = paperData.questions.findIndex(q => q.id === questionId);
    if (index !== -1) {
        paperData.questions.splice(index, 1);
        selectedQuestions.delete(questionId);
        
        renderQuestionsList();
        updateTotalScore();
        updatePreview();
        scheduleAutoSave();
        
        showActionFeedback('题目已删除', 'success');
    }
}

// 切换题目选择
function toggleQuestionSelection(questionId) {
    if (selectedQuestions.has(questionId)) {
        selectedQuestions.delete(questionId);
    } else {
        selectedQuestions.add(questionId);
    }
    
    updateSelectedQuestionCount();
    renderQuestionsList();
}

// 全选/取消全选题目
function toggleSelectAllQuestions() {
    const selectAll = document.getElementById('selectAllQuestions').checked;
    
    if (selectAll) {
        paperData.questions.forEach(q => selectedQuestions.add(q.id));
    } else {
        selectedQuestions.clear();
    }
    
    updateSelectedQuestionCount();
    renderQuestionsList();
}

// 更新选中题目计数
function updateSelectedQuestionCount() {
    const count = selectedQuestions.size;
    document.getElementById('selectedQuestionCount').textContent = count;
    
    const selectAllCheckbox = document.getElementById('selectAllQuestions');
    if (selectAllCheckbox) {
        selectAllCheckbox.indeterminate = count > 0 && count < paperData.questions.length;
        selectAllCheckbox.checked = count === paperData.questions.length && paperData.questions.length > 0;
    }
}

// 批量设置分值
function batchSetScore() {
    if (selectedQuestions.size === 0) {
        showActionFeedback('请先选择要设置分值的题目', 'warning');
        return;
    }
    
    const modal = document.getElementById('batchScoreModal');
    const questionsList = document.getElementById('batchQuestionsList');
    const countSpan = document.getElementById('batchQuestionCount');
    
    countSpan.textContent = selectedQuestions.size;
    
    // 显示选中的题目
    const selectedQuestionsHtml = paperData.questions
        .filter(q => selectedQuestions.has(q.id))
        .map((q, index) => `
            <div class="preview-question-item">
                ${index + 1}. ${q.content || '题目内容待完善'}
            </div>
        `).join('');
    
    questionsList.innerHTML = selectedQuestionsHtml;
    modal.style.display = 'block';
}

// 确认批量设置分值
function confirmBatchScore() {
    const score = parseInt(document.getElementById('batchScore').value);
    
    if (!score || score <= 0) {
        showActionFeedback('请输入有效的分值', 'error');
        return;
    }
    
    // 更新选中题目的分值
    paperData.questions.forEach(question => {
        if (selectedQuestions.has(question.id)) {
            question.score = score;
        }
    });
    
    closeBatchScoreModal();
    renderQuestionsList();
    updateTotalScore();
    updatePreview();
    scheduleAutoSave();
    
    showActionFeedback(`已为 ${selectedQuestions.size} 道题目设置分值为 ${score} 分`, 'success');
}

// 关闭批量设分值模态框
function closeBatchScoreModal() {
    document.getElementById('batchScoreModal').style.display = 'none';
    document.getElementById('batchScore').value = '';
}

// 批量删除题目
function batchDelete() {
    if (selectedQuestions.size === 0) {
        showActionFeedback('请先选择要删除的题目', 'warning');
        return;
    }
    
    if (!confirm(`确定要删除选中的 ${selectedQuestions.size} 道题目吗？`)) return;
    
    // 删除选中的题目
    paperData.questions = paperData.questions.filter(q => !selectedQuestions.has(q.id));
    selectedQuestions.clear();
    
    renderQuestionsList();
    updateTotalScore();
    updatePreview();
    scheduleAutoSave();
    
    showActionFeedback('选中的题目已删除', 'success');
}

// 更新总分
function updateTotalScore() {
    const totalScore = paperData.questions.reduce((sum, question) => sum + question.score, 0);
    paperData.totalScore = totalScore;
    
    document.getElementById('totalScore').value = totalScore;
}

// 更新阈值显示
function updateThresholdValue() {
    const threshold = document.getElementById('reviewThreshold').value;
    document.getElementById('thresholdValue').textContent = threshold + '%';
    paperData.scoringRules.reviewThreshold = parseInt(threshold);
    scheduleAutoSave();
}

// 处理评分规则变化
function handleScoringRuleChange() {
    const strictness = document.querySelector('input[name="strictness"]:checked')?.value;
    if (strictness) {
        paperData.scoringRules.strictness = strictness;
        scheduleAutoSave();
    }
}

// 更新预览
function updatePreview() {
    const previewTitle = document.getElementById('previewTitle');
    const previewSubject = document.getElementById('previewSubject');
    const previewDuration = document.getElementById('previewDuration');
    const previewScore = document.getElementById('previewScore');
    const previewContent = document.getElementById('previewContent');
    
    // 更新标题和元信息
    previewTitle.textContent = paperData.name || '试卷标题';
    previewSubject.textContent = `学科：${getSubjectText(paperData.subject)}`;
    previewDuration.textContent = `时长：${paperData.duration || '--'} 分钟`;
    previewScore.textContent = `总分：${paperData.totalScore || '--'} 分`;
    
    // 更新内容预览
    if (paperData.questions.length === 0) {
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-file-alt"></i>
                <p>填写基本信息和添加题目后，预览将在此显示</p>
            </div>
        `;
    } else {
        const questionsHtml = paperData.questions.map((question, index) => {
            let questionHtml = `
                <div class="preview-question">
                    <div class="preview-question-header">
                        <span class="preview-question-number">${index + 1}. ${question.content || '题目内容待完善'}</span>
                        <span class="preview-question-score">${question.score}分</span>
                    </div>
                    <div class="preview-question-content">
            `;
            
            // 如果是选择题，显示选项
            if (question.options && question.options.length > 0) {
                questionHtml += '<div class="preview-options">';
                question.options.forEach((option, optIndex) => {
                    if (option.trim()) {
                        questionHtml += `<div class="preview-option">${String.fromCharCode(65 + optIndex)}. ${option}</div>`;
                    }
                });
                questionHtml += '</div>';
            }
            
            questionHtml += `
                    </div>
                </div>
            `;
            
            return questionHtml;
        }).join('');
        
        previewContent.innerHTML = questionsHtml;
    }
}

// 获取学科文本
function getSubjectText(subject) {
    const subjectMap = {
        math: '数学',
        english: '英语'
    };
    return subjectMap[subject] || '未选择';
}

// 模板加载
function loadTemplate(templateType) {
    let template;
    
    switch(templateType) {
        case 'math-basic':
            template = {
                name: '数学基础模板',
                subject: 'math',
                duration: 120,
                difficulty: 'medium',
                description: '数学基础知识测试',
                questions: [
                    {
                        id: ++questionCounter,
                        type: 'choice',
                        content: '下列哪个数是质数？',
                        score: 4,
                        options: ['4', '6', '7', '8'],
                        correctAnswers: [2],
                        difficulty: 'easy'
                    },
                    {
                        id: ++questionCounter,
                        type: 'fill',
                        content: '如果 x + 3 = 7，那么 x = ____。',
                        score: 6,
                        options: [],
                        correctAnswers: [],
                        difficulty: 'easy'
                    },
                    {
                        id: ++questionCounter,
                        type: 'essay',
                        content: '解方程：2x² - 5x + 2 = 0',
                        score: 15,
                        options: [],
                        correctAnswers: [],
                        difficulty: 'medium'
                    }
                ]
            };
            break;
            
        case 'english-basic':
            template = {
                name: '英语基础模板',
                subject: 'english',
                duration: 90,
                difficulty: 'medium',
                description: '英语基础能力测试',
                questions: [
                    {
                        id: ++questionCounter,
                        type: 'choice',
                        content: 'Choose the correct word: I ____ to school every day.',
                        score: 3,
                        options: ['go', 'goes', 'going', 'went'],
                        correctAnswers: [0],
                        difficulty: 'easy'
                    },
                    {
                        id: ++questionCounter,
                        type: 'fill',
                        content: 'Complete the sentence: She is ____ (tall) than her sister.',
                        score: 5,
                        options: [],
                        correctAnswers: [],
                        difficulty: 'medium'
                    },
                    {
                        id: ++questionCounter,
                        type: 'composition',
                        content: 'Write a short essay (100-150 words) about your favorite hobby.',
                        score: 25,
                        options: [],
                        correctAnswers: [],
                        difficulty: 'medium'
                    }
                ]
            };
            break;
            
        case 'empty':
        default:
            template = {
                name: '',
                subject: '',
                duration: 120,
                difficulty: 'medium',
                description: '',
                questions: []
            };
            break;
    }
    
    // 应用模板
    paperData = { ...paperData, ...template };
    
    // 更新表单
    updateFormFromData();
    renderQuestionsList();
    updateTotalScore();
    updatePreview();
    
    showActionFeedback('模板已加载', 'success');
}

// 从数据更新表单
function updateFormFromData() {
    document.getElementById('paperName').value = paperData.name;
    document.getElementById('subject').value = paperData.subject;
    document.getElementById('duration').value = paperData.duration;
    document.getElementById('difficulty').value = paperData.difficulty;
    document.getElementById('tags').value = paperData.tags;
    document.getElementById('description').value = paperData.description;
    
    // 触发学科变化处理
    handleSubjectChange();
}

// 自动保存
function setupAutoSave() {
    // 每30秒自动保存到本地存储
    setInterval(() => {
        if (!isAutoSaving) {
            saveToStorage();
        }
    }, 30000);
}

function scheduleAutoSave() {
    if (saveTimer) {
        clearTimeout(saveTimer);
    }
    
    saveTimer = setTimeout(() => {
        saveToStorage();
    }, 2000);
}

function saveToStorage() {
    try {
        localStorage.setItem('paperDraft', JSON.stringify(paperData));
        showSaveIndicator('已自动保存');
    } catch (error) {
        console.error('保存失败:', error);
    }
}

function loadFromStorage() {
    try {
        const saved = localStorage.getItem('paperDraft');
        if (saved) {
            const savedData = JSON.parse(saved);
            
            // 询问是否恢复草稿
            if (confirm('检测到未完成的试卷草稿，是否恢复？')) {
                paperData = savedData;
                questionCounter = Math.max(...paperData.questions.map(q => q.id), 0);
                updateFormFromData();
                renderQuestionsList();
                updateTotalScore();
                updatePreview();
                showActionFeedback('草稿已恢复', 'success');
            }
        }
    } catch (error) {
        console.error('加载草稿失败:', error);
    }
}

// 保存操作
function saveDraft() {
    if (!validateForm()) return;
    
    showLoading(true, '正在保存草稿...');
    isAutoSaving = true;
    
    // 模拟API调用
    setTimeout(() => {
        saveToStorage();
        showLoading(false);
        isAutoSaving = false;
        showActionFeedback('草稿保存成功', 'success');
    }, 1500);
}

function publishPaper() {
    if (!validateForm(true)) return;
    
    showLoading(true, '正在发布试卷...');
    
    // 模拟API调用
    setTimeout(() => {
        showLoading(false);
        localStorage.removeItem('paperDraft');
        showActionFeedback('试卷发布成功', 'success');
        
        // 跳转到试卷列表
        setTimeout(() => {
            window.location.href = '/papers/list';
        }, 1500);
    }, 2000);
}

function previewPaper() {
    if (!paperData.name) {
        showActionFeedback('请先填写试卷名称', 'warning');
        return;
    }
    
    // 保存当前数据到sessionStorage供预览页使用
    sessionStorage.setItem('paperPreview', JSON.stringify(paperData));
    
    // 在新窗口打开预览
    window.open('/papers/preview', '_blank');
}

// 表单验证
function validateForm(isPublish = false) {
    const errors = [];
    
    if (!paperData.name.trim()) {
        errors.push('请填写试卷名称');
    }
    
    if (!paperData.subject) {
        errors.push('请选择学科');
    }
    
    if (paperData.questions.length === 0) {
        errors.push('请至少添加一道题目');
    } else {
        // 检查题目完整性
        const incompleteQuestions = paperData.questions.filter(q => !q.content.trim());
        if (incompleteQuestions.length > 0) {
            errors.push(`有 ${incompleteQuestions.length} 道题目内容不完整`);
        }
        
        // 如果是发布，检查选择题是否有正确答案
        if (isPublish) {
            const choiceQuestions = paperData.questions.filter(q => 
                (q.type === 'choice' || q.type === 'multiple') && q.correctAnswers.length === 0
            );
            if (choiceQuestions.length > 0) {
                errors.push(`有 ${choiceQuestions.length} 道选择题未设置正确答案`);
            }
        }
    }
    
    if (errors.length > 0) {
        showActionFeedback(errors.join('；'), 'error');
        return false;
    }
    
    return true;
}

// 卡片折叠
function toggleCard(cardClass) {
    const card = document.querySelector(`.${cardClass}`);
    const content = card.querySelector('.card-content');
    const header = card.querySelector('.card-header');
    const icon = header.querySelector('.btn-icon i');
    
    content.classList.toggle('collapsed');
    header.classList.toggle('collapsed');
    
    if (content.classList.contains('collapsed')) {
        icon.style.transform = 'rotate(180deg)';
    } else {
        icon.style.transform = 'rotate(0deg)';
    }
}

// 刷新预览
function refreshPreview() {
    updatePreview();
    showActionFeedback('预览已刷新', 'success');
}

// 切换预览大小
function togglePreviewSize() {
    const previewCard = document.querySelector('.preview-card');
    previewCard.classList.toggle('fullscreen');
    
    const icon = document.querySelector('.preview-card .fa-expand');
    if (previewCard.classList.contains('fullscreen')) {
        icon.className = 'fas fa-compress';
    } else {
        icon.className = 'fas fa-expand';
    }
}

// 键盘快捷键
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S: 保存草稿
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveDraft();
    }
    
    // Ctrl/Cmd + P: 预览试卷
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        previewPaper();
    }
    
    // Ctrl/Cmd + Enter: 保存发布
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        publishPaper();
    }
    
    // Alt + A: 添加题目
    if (event.altKey && event.key === 'a') {
        event.preventDefault();
        addQuestion();
    }
}

// 页面离开提醒
function handlePageLeave(event) {
    if (paperData.questions.length > 0 || paperData.name.trim()) {
        event.returnValue = '您有未保存的更改，确定要离开吗？';
        return event.returnValue;
    }
}

// 工具函数
function showLoading(show, message = '加载中...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = loadingOverlay.querySelector('p');
    
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
}

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
        .action-feedback.success { background: #27ae60; }
        .action-feedback.info { background: #3498db; }
        .action-feedback.warning { background: #f39c12; }
        .action-feedback.error { background: #e74c3c; }
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    if (!document.querySelector('style[data-feedback="true"]')) {
        style.setAttribute('data-feedback', 'true');
        document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

function showSaveIndicator(message) {
    let indicator = document.querySelector('.save-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = message;
    indicator.classList.add('show');
    
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

// 选项管理函数（用于模态框内）
window.updateOption = function(index, value) {
    // 这个函数会在模态框内部调用
    console.log(`更新选项 ${index}: ${value}`);
};

window.removeOption = function(index) {
    // 移除选项的逻辑
    console.log(`移除选项 ${index}`);
    // 重新生成表单...
};

window.addOption = function() {
    // 添加新选项的逻辑
    console.log('添加新选项');
    // 重新生成表单...
};

console.log('试卷创建页面已加载完成');