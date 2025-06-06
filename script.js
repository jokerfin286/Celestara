// Global variables
let currentPage = "home"
let currentPost = null
let posts = []
let currentFilter = "all"
let currentSearchTerm = ""
let postsPerPage = 6
let currentPageNumber = 1

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the application
  initializeApp()
})

function initializeApp() {
  // Load saved posts
  posts = loadPosts()

  // Initialize navigation
  initializeNavigation()

  // Initialize admin panel
  initializeAdminPanel()

  // Initialize blog functionality
  initializeBlog()

  // Initialize other features
  initializeOtherFeatures()

  // Load initial content
  loadLatestPosts()
  updateAdminStats()

  // Handle initial route
  const hash = window.location.hash.substring(1)
  if (hash) {
    if (hash.startsWith("post/")) {
      const postId = hash.split("/")[1]
      navigateToPost(postId)
    } else {
      navigateTo(hash)
    }
  }
}

// Navigation System
function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"))

  // Update navigation
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"))

  // Show target page
  const targetPage = document.getElementById(`${page}-page`)
  if (targetPage) {
    targetPage.classList.add("active")
    currentPage = page

    // Update URL
    window.history.pushState({ page }, "", `#${page}`)

    // Update active nav link
    const activeLink = document.querySelector(`[onclick="navigateTo('${page}')"]`)
    if (activeLink) {
      activeLink.classList.add("active")
    }

    // Load page-specific content
    loadPageContent(page)

    // Scroll to top
    window.scrollTo(0, 0)
  }

  // Close mobile menu if open
  const navLinks = document.getElementById("navLinks")
  if (navLinks.classList.contains("active")) {
    navLinks.classList.remove("active")
  }
}

function navigateToPost(postId) {
  const post = posts.find((p) => p.id == postId)
  if (post) {
    currentPost = post

    // Hide all pages
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"))

    // Show post page
    document.getElementById("post-page").classList.add("active")

    // Load post content
    loadPostContent(post)

    // Update URL
    window.history.pushState({ post: postId }, "", `#post/${postId}`)

    // Scroll to top
    window.scrollTo(0, 0)
  }
}

function loadPageContent(page) {
  switch (page) {
    case "blog":
      loadBlogPosts()
      break
    case "home":
      loadLatestPosts()
      break
    default:
      break
  }
}

function loadPostContent(post) {
  const postContent = document.getElementById("postContent")

  // Create media content if available
  let mediaContent = ""
  if (post.image) {
    mediaContent += `
      <div class="post-media">
        <img src="${post.image}" alt="${post.title}" class="post-image">
        <p class="post-media-caption">Изображение к посту: ${post.title}</p>
      </div>
    `
  }

  if (post.video) {
    const isYouTube = post.video.includes("youtube.com") || post.video.includes("youtu.be")
    if (isYouTube) {
      // Convert YouTube URL to embed format
      let embedUrl = post.video
      if (post.video.includes("watch?v=")) {
        embedUrl = post.video.replace("watch?v=", "embed/")
      } else if (post.video.includes("youtu.be/")) {
        embedUrl = post.video.replace("youtu.be/", "youtube.com/embed/")
      }

      mediaContent += `
        <div class="post-media">
          <div class="post-video">
            <iframe src="${embedUrl}" allowfullscreen></iframe>
          </div>
          <p class="post-media-caption">Видео к посту: ${post.title}</p>
        </div>
      `
    } else {
      mediaContent += `
        <div class="post-media">
          <video src="${post.video}" controls class="post-video">
            Ваш браузер не поддерживает видео.
          </video>
          <p class="post-media-caption">Видео к посту: ${post.title}</p>
        </div>
      `
    }
  }

  postContent.innerHTML = `
    <div class="post-header">
      <h1 class="post-title">${post.title}</h1>
      <div class="post-meta">
        <span><i class="fa-solid fa-calendar"></i> ${post.date}</span>
        <span><i class="fa-solid fa-clock"></i> ${post.readTime} мин чтения</span>
        <span><i class="fa-solid fa-eye"></i> ${post.views || 0} просмотров</span>
      </div>
      <div class="devlog-tags">
        ${post.tags.map((tag) => `<span class="devlog-tag">${tag}</span>`).join("")}
      </div>
    </div>
    ${mediaContent}
    <div class="post-content">
      ${formatPostContent(post.content)}
    </div>
    <div class="post-navigation">
      <button class="btn btn-outline" onclick="navigateTo('blog')">
        <i class="fa-solid fa-arrow-left"></i>
        Назад к блогу
      </button>
      <button class="btn btn-outline" onclick="sharePost(${post.id})">
        <i class="fa-solid fa-share"></i>
        Поделиться
      </button>
    </div>
  `

  // Increment views
  post.views = (post.views || 0) + 1
  savePosts(posts)
}

function formatPostContent(content) {
  // Enhanced markdown-like formatting
  return content
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
}

// Navigation initialization
function initializeNavigation() {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const navLinks = document.getElementById("navLinks")

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active")
    })
  }

  // Handle browser back/forward
  window.addEventListener("popstate", (event) => {
    if (event.state) {
      if (event.state.page) {
        navigateTo(event.state.page)
      } else if (event.state.post) {
        navigateToPost(event.state.post)
      }
    }
  })

  // Tab functionality for gameplay page
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab")

      // Update active tab button
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      // Show active tab content
      tabContents.forEach((content) => {
        content.classList.remove("active")
        if (content.id === tabId) {
          content.classList.add("active")
        }
      })
    })
  })
}

// Blog functionality
function initializeBlog() {
  // Filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn")
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter")
      setFilter(filter)

      filterButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")
    })
  })

  // Search functionality
  const searchInput = document.getElementById("blogSearch")
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentSearchTerm = this.value.toLowerCase()
      currentPageNumber = 1
      loadBlogPosts()
    })
  }
}

function setFilter(filter) {
  currentFilter = filter
  currentPageNumber = 1
  loadBlogPosts()
}

function loadBlogPosts() {
  let filteredPosts = posts

  // Apply filter
  if (currentFilter !== "all") {
    filteredPosts = posts.filter((post) =>
      post.tags.some((tag) => tag.toLowerCase().includes(currentFilter.toLowerCase())),
    )
  }

  // Apply search
  if (currentSearchTerm) {
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(currentSearchTerm) ||
        post.excerpt.toLowerCase().includes(currentSearchTerm) ||
        post.tags.some((tag) => tag.toLowerCase().includes(currentSearchTerm)),
    )
  }

  // Pagination
  const totalPosts = filteredPosts.length
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const startIndex = (currentPageNumber - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const postsToShow = filteredPosts.slice(startIndex, endIndex)

  // Render posts
  const container = document.getElementById("blogPostsContainer")
  if (container) {
    container.innerHTML = postsToShow.map((post) => createPostHTML(post)).join("")
  }

  // Render pagination
  renderPagination(totalPages)
}

function loadLatestPosts() {
  const container = document.getElementById("latestPostsContainer")
  if (container) {
    const latestPosts = posts.slice(0, 3)
    container.innerHTML = latestPosts.map((post) => createPostHTML(post, true)).join("")
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById("blogPagination")
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = ""
    return
  }

  let paginationHTML = ""

  // Previous button
  if (currentPageNumber > 1) {
    paginationHTML += `<button onclick="changePage(${currentPageNumber - 1})">
      <i class="fa-solid fa-chevron-left"></i>
    </button>`
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPageNumber) {
      paginationHTML += `<button class="active">${i}</button>`
    } else {
      paginationHTML += `<button onclick="changePage(${i})">${i}</button>`
    }
  }

  // Next button
  if (currentPageNumber < totalPages) {
    paginationHTML += `<button onclick="changePage(${currentPageNumber + 1})">
      <i class="fa-solid fa-chevron-right"></i>
    </button>`
  }

  container.innerHTML = paginationHTML
}

function changePage(page) {
  currentPageNumber = page
  loadBlogPosts()
}

// Admin Panel functionality
function initializeAdminPanel() {
  const adminAccessBtn = document.getElementById("adminAccessBtn")
  const adminPanel = document.getElementById("adminPanel")
  const closeAdminBtn = document.getElementById("closeAdminBtn")
  const addPostForm = document.getElementById("addPostForm")

  // Show/hide admin panel
  if (adminAccessBtn) {
    adminAccessBtn.addEventListener("click", () => {
      adminPanel.style.display = adminPanel.style.display === "none" ? "block" : "none"
      if (adminPanel.style.display === "block") {
        adminPanel.scrollIntoView({ behavior: "smooth" })
        loadAdminPosts()
      }
    })
  }

  if (closeAdminBtn) {
    closeAdminBtn.addEventListener("click", () => {
      adminPanel.style.display = "none"
    })
  }

  // Admin navigation
  const adminNavButtons = document.querySelectorAll(".admin-nav-btn")
  const adminContents = document.querySelectorAll(".admin-content")

  adminNavButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabId = this.getAttribute("data-admin-tab")

      if (tabId) {
        adminNavButtons.forEach((btn) => btn.classList.remove("active"))
        this.classList.add("active")

        adminContents.forEach((content) => {
          content.classList.remove("active")
          if (content.id === `admin-${tabId}`) {
            content.classList.add("active")
          }
        })

        if (tabId === "posts") {
          loadAdminPosts()
        }
      }
    })
  })

  // Add new post
  if (addPostForm) {
    addPostForm.addEventListener("submit", (e) => {
      e.preventDefault()
      addNewPost()
    })
  }

  // Settings form
  const settingsForm = document.getElementById("settingsForm")
  if (settingsForm) {
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault()
      saveSettings()
    })
  }
}

function addNewPost() {
  const title = document.getElementById("post-title").value
  const excerpt = document.getElementById("post-excerpt").value
  const tagsInput = document.getElementById("post-tags").value
  const readTime = document.getElementById("post-readtime").value
  const content = document.getElementById("post-content").value
  const featured = document.getElementById("post-featured").checked
  const image = document.getElementById("post-image").value
  const video = document.getElementById("post-video").value

  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag)

  const newPost = {
    id: Date.now(),
    title: title,
    excerpt: excerpt,
    tags: tags,
    readTime: readTime,
    content: content,
    date: new Date().toLocaleDateString("ru-RU"),
    featured: featured,
    views: 0,
    image: image || null,
    video: video || null,
  }

  // Add to posts array
  posts.unshift(newPost)
  savePosts(posts)

  // Reset form
  document.getElementById("addPostForm").reset()

  // Show notification
  showNotification("Пост успешно добавлен!")

  // Update displays
  loadBlogPosts()
  loadLatestPosts()
  loadAdminPosts()
  updateAdminStats()

  // Hide admin panel
  document.getElementById("adminPanel").style.display = "none"

  // Navigate to blog
  navigateTo("blog")
}

function loadAdminPosts() {
  const container = document.getElementById("adminPostsList")
  if (container) {
    container.innerHTML = posts
      .map(
        (post) => `
      <div class="admin-post-item">
        <div class="admin-post-info">
          <h5>${post.title}</h5>
          <small>${post.date} • ${post.readTime} мин • ${post.views || 0} просмотров</small>
          ${post.image ? '<small style="color: var(--color-blue-light);">📷 Изображение</small>' : ""}
          ${post.video ? '<small style="color: var(--color-red);">🎥 Видео</small>' : ""}
        </div>
        <div class="admin-post-actions">
          <button class="btn btn-sm btn-outline" onclick="editPost(${post.id})">
            <i class="fa-solid fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-red" onclick="deletePost(${post.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `,
      )
      .join("")
  }
}

function editPost(postId) {
  const post = posts.find((p) => p.id === postId)
  if (post) {
    document.getElementById("post-title").value = post.title
    document.getElementById("post-excerpt").value = post.excerpt
    document.getElementById("post-tags").value = post.tags.join(", ")
    document.getElementById("post-readtime").value = post.readTime
    document.getElementById("post-content").value = post.content
    document.getElementById("post-featured").checked = post.featured || false
    document.getElementById("post-image").value = post.image || ""
    document.getElementById("post-video").value = post.video || ""

    // Remove the post temporarily for editing
    posts = posts.filter((p) => p.id !== postId)
    savePosts(posts)
    loadAdminPosts()
  }
}

function deletePost(postId) {
  if (confirm("Вы уверены, что хотите удалить этот пост?")) {
    posts = posts.filter((p) => p.id !== postId)
    savePosts(posts)

    showNotification("Пост удален!")
    loadBlogPosts()
    loadLatestPosts()
    loadAdminPosts()
    updateAdminStats()
  }
}

function updateAdminStats() {
  // Update posts count
  const totalBlogPostsElement = document.getElementById("totalBlogPosts")
  if (totalBlogPostsElement) {
    totalBlogPostsElement.textContent = posts.length
  }

  // Update page views (mock data)
  const pageViewsElement = document.getElementById("pageViews")
  if (pageViewsElement) {
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0) + 1234
    pageViewsElement.textContent = totalViews.toLocaleString()
  }
}

function saveSettings() {
  const settings = {
    siteTitle: document.getElementById("site-title").value,
    siteDescription: document.getElementById("site-description").value,
    postsPerPage: Number.parseInt(document.getElementById("posts-per-page").value),
    enableComments: document.getElementById("enable-comments").checked,
    enableAnalytics: document.getElementById("enable-analytics").checked,
  }

  localStorage.setItem("celestara-settings", JSON.stringify(settings))
  postsPerPage = settings.postsPerPage

  showNotification("Настройки сохранены!")
}

// Utility functions
function loadPosts() {
  const savedPosts = localStorage.getItem("celestara-devlog-posts")
  const defaultPosts = [
    {
      id: 1,
      title: "Как мы реализовали ИИ врагов",
      excerpt: "Разбираем систему поведения врагов: радиус атаки, преследование и тактическое отступление.",
      tags: ["ИИ", "Геймплей", "Программирование"],
      readTime: 5,
      content: `# Как мы реализовали ИИ врагов

В этом посте мы расскажем о том, как создавали систему искусственного интеллекта для врагов в Celestara.

## Основные принципы

Мы хотели создать врагов, которые:
- **Адаптируются к поведению игрока** - изучают ваши паттерны атак
- **Работают в команде** - координируют свои действия
- **Создают интересные тактические ситуации** - заставляют думать

## Типы поведения

### Агрессивный тип
Эти враги атакуют в лоб, но учатся избегать ваших любимых комбо-атак.

### Тактический тип  
Держат дистанцию, изучают ваши движения и атакуют в моменты уязвимости.

### Поддержка
Усиливают других врагов и пытаются заблокировать пути отступления.

## Реализация

Для каждого типа врага мы создали отдельную систему поведения с использованием конечных автоматов и дерева решений. Враги анализируют последние 10 действий игрока и адаптируют свою тактику.

**Результат:** Каждый бой ощущается уникально, даже против одинаковых типов врагов.`,
      date: "15.12.2024",
      featured: true,
      views: 156,
      image: "https://placehold.co/800x400/1a1a2e/FFFFFF?text=AI+System+Diagram",
      video: null,
    },
    {
      id: 2,
      title: "Почему мы не делаем roguelike про космос",
      excerpt: "История выбора сеттинга и почему острова в небе оказались интереснее звёздных кораблей.",
      tags: ["Дизайн", "Концепт", "История"],
      readTime: 3,
      content: `# Почему мы не делаем roguelike про космос

Изначально Celestara задумывалась как космический roguelike. Но в процессе разработки мы поняли, что парящие острова дают больше возможностей для геймплея.

## Проблемы космической тематики

- **Ограниченность в дизайне уровней** - космос слишком пустой
- **Сложность объяснения физики** - почему корабль не может просто улететь?
- **Перенасыщенность рынка** - слишком много космических игр

## Преимущества островов

Парящие острова позволили нам:

### Создать вертикальность
Игроки могут падать с островов, что добавляет риск в каждое движение.

### Ограничить пространство естественно
Мосты между островами создают естественные "бутылочные горлышки" для тактических сражений.

### Добавить атмосферу
Парящие острова в облаках создают ощущение магии и чуда.

## Влияние на геймплей

Смена сеттинга кардинально изменила игру к лучшему. Теперь каждый остров - это мини-арена с уникальными тактическими возможностями.`,
      date: "10.12.2024",
      featured: false,
      views: 89,
      image: null,
      video: null,
    },
    {
      id: 3,
      title: "Смерть как фича: почему мосты блокируются",
      excerpt: "Как механика блокировки мостов во время боя влияет на тактику и напряжение в игре.",
      tags: ["Геймдизайн", "Механики", "Баланс"],
      readTime: 4,
      content: `# Смерть как фича: почему мосты блокируются

Одна из ключевых механик Celestara - блокировка мостов во время боя. Эта система кардинально меняет подход к сражениям.

## Психология игрока

Когда игрок знает, что не может убежать, он:
- **Более осторожно планирует атаки** - нет права на ошибку
- **Изучает паттерны врагов** - знание = выживание  
- **Использует окружение** - каждый элемент может спасти жизнь

## Влияние на геймплей

Блокировка мостов создает:

### Напряжение
Каждый бой становится вопросом жизни и смерти.

### Тактическое планирование
Игроки изучают остров перед началом боя, планируя маршруты и укрытия.

### Уникальные ситуации
Иногда лучше не начинать бой, если на острове слишком много врагов.

## Техническая реализация

Мосты блокируются магическими барьерами, которые исчезают только после победы над всеми врагами на острове. Это объясняется лором игры - острова защищены древней магией.

**Результат:** Игроки не могут "пробежать" игру, каждый бой требует мастерства.`,
      date: "05.12.2024",
      featured: false,
      views: 134,
      image: "https://placehold.co/600x300/1a1a2e/FFFFFF?text=Bridge+Blocking+Mechanic",
      video: null,
    },
    {
      id: 4,
      title: "Как работает генерация островов",
      excerpt: "Технические детали процедурной генерации уровней и создания связанных островов.",
      tags: ["Технологии", "Генерация", "Уровни"],
      readTime: 6,
      content: `# Как работает генерация островов

Процедурная генерация - сердце Celestara. Каждый уровень создается уникальным, но при этом сбалансированным.

## Алгоритм генерации

1. **Создание базовой сетки** - определяем возможные позиции островов
2. **Размещение островов** - используем алгоритм Пуассона для равномерного распределения
3. **Соединение мостами** - создаем граф связности
4. **Проверка проходимости** - убеждаемся, что все острова достижимы
5. **Размещение врагов и предметов** - балансируем сложность

## Технические детали

Мы используем модифицированный алгоритм Делоне для создания естественно выглядящих связей между островами.

### Размеры островов
- **Маленькие:** 3x3 тайла - для быстрых схваток
- **Средние:** 5x5 тайлов - основной размер
- **Большие:** 7x7 тайлов - для боссов

### Типы мостов
- **Прямые:** 3x1 тайла
- **Изогнутые:** L-образные соединения
- **Длинные:** до 5 тайлов для больших расстояний

## Балансировка

Каждый уровень проходит проверку на:
- Количество врагов (не более 3 на маленьком острове)
- Доступность лута (минимум 1 предмет на 2 острова)
- Сложность маршрута (альтернативные пути)

**Результат:** Каждый уровень уникален, но справедлив.`,
      date: "28.11.2024",
      featured: true,
      views: 203,
      image: null,
      video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: 5,
      title: "Система оружия: от мечей до магии",
      excerpt: "Подробный разбор всех типов оружия в Celestara и их уникальных механик.",
      tags: ["Геймплей", "Оружие", "Баланс"],
      readTime: 7,
      content: `# Система оружия: от мечей до магии

В Celestara представлено три основных класса оружия, каждый со своими уникальными механиками и стилем игры.

## Оружие ближнего боя

### Мечи
- **Урон:** Высокий
- **Скорость:** Средняя
- **Особенность:** Комбо-атаки
- **Стамина:** 15 за удар

### Кинжалы  
- **Урон:** Средний
- **Скорость:** Высокая
- **Особенность:** Критические удары сзади
- **Стамина:** 10 за удар

### Молоты
- **Урон:** Очень высокий
- **Скорость:** Низкая
- **Особенность:** Оглушение врагов
- **Стамина:** 25 за удар

## Дальнобойное оружие

### Луки
- **Урон:** Средний
- **Дальность:** Высокая
- **Особенность:** Заряженные выстрелы
- **Стамина:** 12 за выстрел

### Арбалеты
- **Урон:** Высокий
- **Дальность:** Средняя
- **Особенность:** Пробивание брони
- **Стамина:** 18 за выстрел

## Магическое оружие

### Посохи
- **Урон:** Магический
- **Дальность:** Средняя
- **Особенность:** Элементальный урон
- **Стамина:** 20 за заклинание

### Орбы
- **Урон:** Низкий, но постоянный
- **Дальность:** Высокая
- **Особенность:** Самонаводящиеся снаряды
- **Стамина:** 8 за снаряд

## Система улучшений

Каждое оружие можно улучшить:
- **+1:** +20% урона
- **+2:** +40% урона, новая способность
- **+3:** +60% урона, уникальный эффект

**Совет:** Экспериментируйте с разными типами оружия - каждый враг имеет слабости к определенным видам атак!`,
      date: "22.11.2024",
      featured: true,
      views: 178,
      image: "https://placehold.co/700x350/1a1a2e/FFFFFF?text=Weapon+Types+Chart",
      video: null,
    },
  ]

  return savedPosts ? JSON.parse(savedPosts) : defaultPosts
}

function savePosts(posts) {
  localStorage.setItem("celestara-devlog-posts", JSON.stringify(posts))
}

function createPostHTML(post, isLatest = false) {
  return `
    <div class="blog-post ${isLatest ? "latest-post" : ""}">
      <a href="#post/${post.id}" onclick="navigateToPost('${post.id}')" class="post-link">
        <h3 class="post-title">${post.title}</h3>
        <p class="post-excerpt">${post.excerpt}</p>
        <div class="post-meta">
          <span><i class="fa-solid fa-calendar"></i> ${post.date}</span>
          <span><i class="fa-solid fa-clock"></i> ${post.readTime} мин</span>
          ${post.image ? '<span><i class="fa-solid fa-image"></i> Фото</span>' : ""}
          ${post.video ? '<span><i class="fa-solid fa-video"></i> Видео</span>' : ""}
        </div>
        <div class="devlog-tags">
          ${post.tags.map((tag) => `<span class="devlog-tag">${tag}</span>`).join("")}
        </div>
        ${post.featured ? '<div class="devlog-meta"><small class="featured-badge"><i class="fa-solid fa-star"></i> Рекомендуемый</small></div>' : ""}
      </a>
    </div>
  `
}

function initializeOtherFeatures() {
  // FAQ functionality
  const faqItems = document.querySelectorAll(".faq-item")
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")
    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active")

      // Close all FAQ items
      faqItems.forEach((faq) => faq.classList.remove("active"))

      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add("active")
      }
    })
  })

  // Form submission handling
  const feedbackForm = document.querySelector(".feedback-form")
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (e) => {
      e.preventDefault()
      showNotification("Спасибо за ваш отзыв! В реальной версии сайта форма будет отправлять данные на сервер.")
    })
  }

  const newsletterForm = document.querySelector(".newsletter-form")
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault()
      showNotification("Спасибо за подписку! В реальной версии сайта вы получите письмо с подтверждением.")
    })
  }

  // Download buttons functionality
  const downloadPcBtn = document.getElementById("downloadPcBtn")
  const downloadMobileBtn = document.getElementById("downloadMobileBtn")

  if (downloadPcBtn) {
    downloadPcBtn.addEventListener("click", () => {
      showNotification("Переход на страницу загрузки для ПК (Windows/Mac/Linux)")
    })
  }

  if (downloadMobileBtn) {
    downloadMobileBtn.addEventListener("click", () => {
      showNotification("Переход в магазин приложений для загрузки мобильной версии")
    })
  }

  // Gallery image click for lightbox effect
  const galleryImages = document.querySelectorAll(".gallery-image")
  galleryImages.forEach((image) => {
    image.addEventListener("click", () => {
      showNotification("В полной версии сайта здесь откроется лайтбокс с увеличенным изображением или GIF.")
    })
  })

  // Intersection Observer for scroll-based animations
  const observerOptions = {
    threshold: 0.1,
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in")
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Elements to animate on scroll
  const animateElements = document.querySelectorAll(
    ".section-title, .feature-card, .gallery-item, .devlog-card, .tab-card, .download-card, .contact-card, .roadmap-item",
  )

  animateElements.forEach((element) => {
    observer.observe(element)
  })
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.classList.add("post-notification", "show")
  notification.innerHTML = `
    <span>${message}</span>
    <button class="close-btn">&times;</button>
  `

  document.body.appendChild(notification)

  // Auto hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)

  // Manual close
  notification.querySelector(".close-btn").addEventListener("click", () => {
    notification.classList.remove("show")
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  })
}

function sharePost(postId) {
  const post = posts.find((p) => p.id === postId)
  if (post && navigator.share) {
    navigator.share({
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href)
    showNotification("Ссылка скопирована в буфер обмена!")
  }
}
