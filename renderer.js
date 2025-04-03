// Controlador de estado de la aplicación
const AppState = {
  // Estado general
  currentPage: "login",
  serverMode: false,
  licenseActive: false,
  isConnected: false,
  isAppReady: false,

  // Usuario actual
  currentUser: null,

  // Datos de la aplicación
  products: [],
  categories: [],
  customers: [],
  sales: [],
  users: [],

  // Estado del carrito
  cart: [],
  selectedCustomer: 0,
  discount: 0,
  taxRate: 0,

  // Configuración
  settings: {
    currency: "RD$",
    taxRate: 18,
    storeName: "Mi Tienda",
    storeAddress: "",
    storePhone: "",
    storeEmail: "",
  },

  // Métodos para actualizar el estado
  setCurrentPage(page) {
    this.currentPage = page;
    this.updateUI();
  },

  setServerMode(mode) {
    this.serverMode = mode;
  },

  setLicenseActive(active) {
    this.licenseActive = active;
  },

  setCurrentUser(user) {
    this.currentUser = user;
  },

  setProducts(products) {
    this.products = products;
  },

  setCategories(categories) {
    this.categories = categories;
  },

  setCustomers(customers) {
    this.customers = customers;
  },

  setSales(sales) {
    this.sales = sales;
  },

  setUsers(users) {
    this.users = users;
  },

  setSettings(settings) {
    this.settings = { ...this.settings, ...settings };
  },

  // Métodos para gestionar el carrito
  addToCart(product, quantity = 1) {
    const existingItem = this.cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        tax_rate: product.tax_rate || this.settings.taxRate,
        subtotal: product.price * quantity,
      });
    }

    this.updateCartTotals();
    this.renderCart();
  },

  removeFromCart(index) {
    this.cart.splice(index, 1);
    this.updateCartTotals();
    this.renderCart();
  },

  updateCartQuantity(index, quantity) {
    if (quantity > 0) {
      this.cart[index].quantity = quantity;
      this.cart[index].subtotal = this.cart[index].price * quantity;
      this.updateCartTotals();
      this.renderCart();
    } else {
      this.removeFromCart(index);
    }
  },

  clearCart() {
    this.cart = [];
    this.discount = 0;
    document.getElementById("discount-input").value = 0;
    this.updateCartTotals();
    this.renderCart();
  },

  setDiscount(discount) {
    this.discount = parseFloat(discount) || 0;
    this.updateCartTotals();
  },

  updateCartTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = this.cart.reduce((sum, item) => {
      const itemTaxRate = item.tax_rate || this.settings.taxRate;
      return sum + (item.subtotal * itemTaxRate) / 100;
    }, 0);

    const total = subtotal + tax - this.discount;

    // Actualizar los elementos en la UI
    const subtotalEl = document.getElementById("cart-subtotal");
    const taxEl = document.getElementById("cart-tax");
    const totalEl = document.getElementById("cart-total");

    if (subtotalEl)
      subtotalEl.textContent = `${this.settings.currency}${subtotal.toFixed(
        2
      )}`;
    if (taxEl) taxEl.textContent = `${this.settings.currency}${tax.toFixed(2)}`;
    if (totalEl)
      totalEl.textContent = `${this.settings.currency}${total.toFixed(2)}`;
  },

  setSelectedCustomer(customerId) {
    this.selectedCustomer = customerId;
  },

  // Métodos para actualizar la UI
  updateUI() {
    // Esta función se llama cuando cambia el estado principal y actualiza la UI
    this.showCurrentPage();
    this.updateCartTotals();

    // Actualizar información del usuario en la UI
    if (this.currentUser) {
      const usernameDisplay = document.getElementById("username-display");
      if (usernameDisplay) {
        usernameDisplay.textContent =
          this.currentUser.name || this.currentUser.username;
      }
    }

    // Actualizar indicador de modo servidor
    const serverIndicator = document.getElementById("server-indicator");
    if (serverIndicator) {
      serverIndicator.textContent = this.serverMode
        ? "Modo: Servidor"
        : "Modo: Cliente";
      serverIndicator.className = this.serverMode
        ? "text-sm text-green-600"
        : "text-sm";
    }
  },

  renderCart() {
    const cartContainer = document.getElementById("cart-items");
    if (!cartContainer) return;

    if (this.cart.length === 0) {
      cartContainer.innerHTML =
        '<p class="text-center text-gray-400 py-12">Añada productos al carrito</p>';
      return;
    }

    let cartHtml = "";
    this.cart.forEach((item, index) => {
      cartHtml += `
          <div class="flex flex-col p-2 border-b">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h4 class="font-medium text-sm">${item.name}</h4>
                <p class="text-xs text-gray-500">${
                  this.settings.currency
                }${item.price.toFixed(2)} c/u</p>
              </div>
              <button class="text-red-500 hover:text-red-700" onclick="AppState.removeFromCart(${index})">
                <i class="bi bi-x"></i>
              </button>
            </div>
            <div class="flex justify-between items-center mt-2">
              <div class="flex items-center">
                <button class="w-6 h-6 border rounded-full flex items-center justify-center" onclick="AppState.updateCartQuantity(${index}, ${
        item.quantity - 1
      })">
                  <i class="bi bi-dash"></i>
                </button>
                <input type="number" class="w-10 text-center border-0 p-0 mx-2" value="${
                  item.quantity
                }" 
                  onchange="AppState.updateCartQuantity(${index}, parseInt(this.value) || 1)" min="1">
                <button class="w-6 h-6 border rounded-full flex items-center justify-center" onclick="AppState.updateCartQuantity(${index}, ${
        item.quantity + 1
      })">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
              <span class="font-medium">${
                this.settings.currency
              }${item.subtotal.toFixed(2)}</span>
            </div>
          </div>
        `;
    });

    cartContainer.innerHTML = cartHtml;
  },

  renderProductsGrid() {
    const productsContainer = document.getElementById("products-container");
    if (!productsContainer) return;

    if (this.products.length === 0) {
      productsContainer.innerHTML = `
          <div class="col-span-full p-8 text-center text-gray-400">
            <i class="bi bi-inbox text-3xl mb-2"></i>
            <p>No hay productos disponibles</p>
          </div>
        `;
      return;
    }

    let productsHtml = "";
    this.products.forEach((product) => {
      productsHtml += `
          <div class="product-card bg-white rounded-xl shadow hover:shadow-md p-4 flex flex-col" onclick="AppState.addToCart({
            id: ${product.id},
            name: '${product.name.replace(/'/g, "\\'")}',
            price: ${product.price},
            tax_rate: ${product.tax_rate || 0}
          })">
            <div class="h-28 flex items-center justify-center mb-3">
              <img src="${
                product.image
                  ? product.image
                  : "./assets/images/product-placeholder.png"
              }" alt="${
        product.name
      }" class="max-h-full max-w-full object-contain">
            </div>
            <h3 class="font-medium text-sm mb-1 truncate">${product.name}</h3>
            <div class="flex justify-between items-center mt-auto">
              <span class="font-bold text-blue-600">${
                this.settings.currency
              }${product.price.toFixed(2)}</span>
              <span class="text-xs text-gray-500">${
                product.stock > 0 ? `${product.stock} uds.` : "Agotado"
              }</span>
            </div>
          </div>
        `;
    });

    productsContainer.innerHTML = productsHtml;
  },

  renderProductsTable() {
    const productsTableBody = document.getElementById("products-table-body");
    if (!productsTableBody) return;

    if (this.products.length === 0) {
      productsTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="p-8 text-center text-gray-400">
              <i class="bi bi-inbox text-3xl mb-2"></i>
              <p>No hay productos disponibles</p>
            </td>
          </tr>
        `;
      return;
    }

    let tableHtml = "";
    this.products.forEach((product) => {
      // Buscar categoría
      const category = this.categories.find(
        (cat) => cat.id === product.category_id
      );

      tableHtml += `
          <tr class="border-b hover:bg-gray-50">
            <td class="p-4">${product.barcode || "-"}</td>
            <td class="p-4">${product.name}</td>
            <td class="p-4">${category ? category.name : "-"}</td>
            <td class="p-4">${this.settings.currency}${product.price.toFixed(
        2
      )}</td>
            <td class="p-4">${product.stock}</td>
            <td class="p-4">
              <div class="flex gap-2">
                <button class="p-1 text-blue-600 hover:text-blue-800" onclick="UI.showEditProductModal(${
                  product.id
                })">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="p-1 text-red-600 hover:text-red-800" onclick="UI.showDeleteProductModal(${
                  product.id
                })">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
    });

    productsTableBody.innerHTML = tableHtml;
  },

  renderCategoriesTable() {
    const categoriesTableBody = document.getElementById(
      "categories-table-body"
    );
    if (!categoriesTableBody) return;

    if (this.categories.length === 0) {
      categoriesTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="p-8 text-center text-gray-400">
              <i class="bi bi-inbox text-3xl mb-2"></i>
              <p>No hay categorías disponibles</p>
            </td>
          </tr>
        `;
      return;
    }

    let tableHtml = "";
    this.categories.forEach((category) => {
      // Contar productos en esta categoría
      const productCount = this.products.filter(
        (p) => p.category_id === category.id
      ).length;

      tableHtml += `
          <tr class="border-b hover:bg-gray-50">
            <td class="p-4">${category.id}</td>
            <td class="p-4">${category.name}</td>
            <td class="p-4">${category.description || "-"}</td>
            <td class="p-4">${productCount}</td>
            <td class="p-4">
              <div class="flex gap-2">
                <button class="p-1 text-blue-600 hover:text-blue-800" onclick="UI.showEditCategoryModal(${
                  category.id
                })">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="p-1 text-red-600 hover:text-red-800" onclick="UI.showDeleteCategoryModal(${
                  category.id
                })">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
    });

    categoriesTableBody.innerHTML = tableHtml;
  },

  updateCategoryFilter() {
    const categoryFilter = document.getElementById("category-filter");
    if (!categoryFilter) return;

    // Limpiar opciones existentes
    categoryFilter.innerHTML =
      '<option value="all">Todas las categorías</option>';

    // Añadir opciones de categorías
    this.categories.forEach((category) => {
      categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
    });
  },

  updateCustomerSelect() {
    const customerSelect = document.getElementById("customer-select");
    if (!customerSelect) return;

    // Limpiar opciones existentes
    customerSelect.innerHTML = '<option value="0">Cliente ocasional</option>';

    // Añadir opciones de clientes
    this.customers.forEach((customer) => {
      customerSelect.innerHTML += `<option value="${customer.id}">${customer.name}</option>`;
    });
  },

  showCurrentPage() {
    // Ocultar todas las páginas
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.add("hidden");
    });

    // Mostrar la página actual
    const currentPageElement = document.getElementById(
      `${this.currentPage}-page`
    );
    if (currentPageElement) {
      currentPageElement.classList.remove("hidden");
    }

    // Actualizar título
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) {
      switch (this.currentPage) {
        case "dashboard":
          pageTitle.textContent = "Dashboard";
          break;
        case "pos":
          pageTitle.textContent = "Punto de Venta";
          break;
        case "products":
          pageTitle.textContent = "Productos";
          break;
        case "categories":
          pageTitle.textContent = "Categorías";
          break;
        case "customers":
          pageTitle.textContent = "Clientes";
          break;
        case "transactions":
          pageTitle.textContent = "Transacciones";
          break;
        case "users":
          pageTitle.textContent = "Usuarios";
          break;
        case "settings":
          pageTitle.textContent = "Configuración";
          break;
        default:
          pageTitle.textContent = "WilPOS";
      }
    }

    // Si estamos en el layout principal, actualizar el menú activo
    if (
      [
        "dashboard",
        "pos",
        "products",
        "categories",
        "customers",
        "transactions",
        "users",
        "settings",
      ].includes(this.currentPage)
    ) {
      // Mostrar el layout principal si no está visible
      document.getElementById("main-layout").classList.remove("hidden");

      // Actualizar ítem activo en el menú
      document.querySelectorAll(".sidebar-item").forEach((item) => {
        item.classList.remove("sidebar-item-active");
      });

      const activeMenuItem = document.querySelector(
        `.sidebar-item[data-page="${this.currentPage}"]`
      );
      if (activeMenuItem) {
        activeMenuItem.classList.add("sidebar-item-active");
      }

      // Cargar datos específicos según la página
      this.loadPageData();
    } else {
      // Ocultar el layout principal para páginas como login, license, etc.
      document.getElementById("main-layout").classList.add("hidden");
    }
  },

  loadPageData() {
    // Cargar los datos necesarios para la página actual
    switch (this.currentPage) {
      case "dashboard":
        this.loadDashboardData();
        break;
      case "pos":
        this.loadPosData();
        break;
      case "products":
        this.loadProductsData();
        break;
      case "categories":
        this.loadCategoriesData();
        break;
      case "customers":
        this.loadCustomersData();
        break;
      case "transactions":
        this.loadTransactionsData();
        break;
      case "users":
        this.loadUsersData();
        break;
      case "settings":
        this.loadSettingsData();
        break;
    }
  },

  async loadDashboardData() {
    // Cargar datos para el dashboard
    try {
      // En un sistema real, cargaríamos varios datos aquí
      const salesData = await window.api.getSales({ period: "today" });
      const productsCount = this.products.length;
      const customersCount = this.customers.length;
      const usersCount = await window.api.getUsersCount();

      // Actualizar contadores
      document.getElementById("today-sales").textContent = `${
        this.settings.currency
      }${salesData.total.toFixed(2)}`;
      document.getElementById("today-transactions").textContent =
        salesData.count;
      document.getElementById("products-count").textContent = productsCount;
      document.getElementById("customers-count").textContent = customersCount;
      document.getElementById("users-count").textContent = usersCount;

      // Actualizar gráfico de ventas
      this.renderSalesChart();

      // Actualizar productos más vendidos
      this.renderTopProducts();
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
      UI.showNotification("Error al cargar datos del dashboard", "error");
    }
  },

  async loadPosData() {
    // Si no tenemos productos cargados, cargarlos
    if (this.products.length === 0) {
      try {
        const result = await window.api.getProducts();
        if (result.success) {
          this.setProducts(result.data);
          this.renderProductsGrid();
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);
        UI.showNotification("Error al cargar productos", "error");
      }
    } else {
      this.renderProductsGrid();
    }

    // Si no tenemos categorías cargadas, cargarlas
    if (this.categories.length === 0) {
      try {
        const result = await window.api.getCategories();
        if (result.success) {
          this.setCategories(result.data);
          this.updateCategoryFilter();
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    } else {
      this.updateCategoryFilter();
    }

    // Si no tenemos clientes cargados, cargarlos
    if (this.customers.length === 0) {
      try {
        const result = await window.api.getCustomers();
        if (result.success) {
          this.setCustomers(result.data);
          this.updateCustomerSelect();
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    } else {
      this.updateCustomerSelect();
    }

    // Renderizar el carrito
    this.renderCart();
    this.updateCartTotals();
  },

  async loadProductsData() {
    try {
      const result = await window.api.getProducts();
      if (result.success) {
        this.setProducts(result.data);
        this.renderProductsTable();
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      UI.showNotification("Error al cargar productos", "error");
    }

    // Si no tenemos categorías cargadas, cargarlas
    if (this.categories.length === 0) {
      try {
        const result = await window.api.getCategories();
        if (result.success) {
          this.setCategories(result.data);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    }
  },

  async loadCategoriesData() {
    try {
      const result = await window.api.getCategories();
      if (result.success) {
        this.setCategories(result.data);
        this.renderCategoriesTable();
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      UI.showNotification("Error al cargar categorías", "error");
    }
  },

  async loadCustomersData() {
    try {
      const result = await window.api.getCustomers();
      if (result.success) {
        this.setCustomers(result.data);
        // Renderizar tabla de clientes (implementar después)
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      UI.showNotification("Error al cargar clientes", "error");
    }
  },

  async loadTransactionsData() {
    try {
      const result = await window.api.getSales({});
      if (result.success) {
        this.setSales(result.data);
        // Renderizar tabla de transacciones (implementar después)
      }
    } catch (error) {
      console.error("Error al cargar transacciones:", error);
      UI.showNotification("Error al cargar transacciones", "error");
    }
  },

  async loadUsersData() {
    try {
      const result = await window.api.getUsers();
      if (result.success) {
        this.setUsers(result.data);
        // Renderizar tabla de usuarios (implementar después)
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      UI.showNotification("Error al cargar usuarios", "error");
    }
  },

  async loadSettingsData() {
    try {
      const result = await window.api.getSettings();
      if (result.success) {
        this.setSettings(result.data);

        // Actualizar campos del formulario
        document.getElementById("store-name").value =
          this.settings.store_name || "";
        document.getElementById("store-address").value =
          this.settings.store_address || "";
        document.getElementById("store-phone").value =
          this.settings.store_phone || "";
        document.getElementById("store-email").value =
          this.settings.store_email || "";
        document.getElementById("tax-rate").value = this.settings.tax_rate || 0;
        document.getElementById("currency").value =
          this.settings.currency || "RD$";
      }
    } catch (error) {
      console.error("Error al cargar configuraciones:", error);
      UI.showNotification("Error al cargar configuraciones", "error");
    }

    // Cargar información de licencia si corresponde
    if (this.serverMode) {
      try {
        const licenseInfo = await window.api.getLicenseInfo();
        const licenseInfoContainer = document.getElementById("license-info");
        if (licenseInfoContainer) {
          if (licenseInfo.activated) {
            licenseInfoContainer.innerHTML = `
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <span class="font-medium">Licencia Activa</span>
                </div>
                <p><strong>Clave:</strong> ${licenseInfo.licenseKey}</p>
                <p><strong>Fecha de activación:</strong> ${new Date(
                  licenseInfo.activationDate
                ).toLocaleDateString()}</p>
                <p><strong>Fecha de vencimiento:</strong> ${new Date(
                  licenseInfo.expiryDate
                ).toLocaleDateString()}</p>
                <p><strong>Días restantes:</strong> ${
                  licenseInfo.daysRemaining
                }</p>
              `;
          } else {
            licenseInfoContainer.innerHTML = `
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-3 h-3 rounded-full bg-red-500"></div>
                  <span class="font-medium">Licencia Inactiva</span>
                </div>
                <p>No hay una licencia activa para el modo servidor.</p>
              `;
          }
        }
      } catch (error) {
        console.error("Error al cargar información de licencia:", error);
      }
    }
  },

  renderSalesChart() {
    const canvas = document.getElementById("sales-chart");
    if (!canvas) return;

    // Datos de ejemplo para el gráfico
    const data = {
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      datasets: [
        {
          label: "Ventas de la semana",
          data: [2500, 3800, 2900, 4200, 3600, 5100, 4800],
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          borderColor: "rgba(52, 152, 219, 1)",
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: "white",
          pointBorderColor: "rgba(52, 152, 219, 1)",
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    };

    // Configuración del gráfico
    const config = {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              callback: function (value) {
                return AppState.settings.currency + value.toLocaleString();
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return (
                  AppState.settings.currency + context.parsed.y.toLocaleString()
                );
              },
            },
          },
        },
      },
    };

    // Crear gráfico
    if (window.salesChart) {
      window.salesChart.destroy();
    }

    window.salesChart = new Chart(canvas, config);
  },

  renderTopProducts() {
    const container = document.getElementById("top-products");
    if (!container) return;

    // Datos de ejemplo para productos más vendidos
    const topProducts = [
      { name: "Producto A", percentage: 65 },
      { name: "Producto B", percentage: 45 },
      { name: "Producto C", percentage: 32 },
      { name: "Producto D", percentage: 28 },
      { name: "Producto E", percentage: 20 },
    ];

    let html = "";
    topProducts.forEach((product) => {
      html += `
          <div class="space-y-1 mb-3">
            <div class="flex justify-between items-center">
              <div class="flex gap-2 items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p class="text-sm">${product.name}</p>
              </div>
              <span class="text-sm text-gray-600">${product.percentage}%</span>
            </div>
            <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" style="width: ${product.percentage}%"></div>
            </div>
          </div>
        `;
    });

    container.innerHTML = html;
  },
};

// Controlador de UI para gestionar interacciones de interfaz
const UI = {
  // Mostrar notificaciones
  showNotification(message, type = "info") {
    const container = document.getElementById("notifications-container");
    if (!container) return;

    const notification = document.createElement("div");
    notification.className = `p-4 rounded-lg shadow-lg max-w-xs w-full flex items-center gap-3 animate-fade-in`;

    let bgColor, iconClass;

    switch (type) {
      case "success":
        bgColor = "bg-green-100 text-green-800 border-l-4 border-green-500";
        iconClass = "bi-check-circle-fill text-green-500";
        break;
      case "error":
        bgColor = "bg-red-100 text-red-800 border-l-4 border-red-500";
        iconClass = "bi-x-circle-fill text-red-500";
        break;
      case "warning":
        bgColor = "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500";
        iconClass = "bi-exclamation-triangle-fill text-yellow-500";
        break;
      default:
        bgColor = "bg-blue-100 text-blue-800 border-l-4 border-blue-500";
        iconClass = "bi-info-circle-fill text-blue-500";
    }

    notification.className += ` ${bgColor}`;

    notification.innerHTML = `
        <i class="bi ${iconClass} text-lg"></i>
        <span>${message}</span>
      `;

    container.appendChild(notification);

    // Remover después de 4 segundos
    setTimeout(() => {
      notification.classList.add("animate-fade-out");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 4000);
  },

  // Modales para productos
  showAddProductModal() {
    const modal = document.getElementById("product-modal");
    const modalTitle = modal.querySelector(".modal-title");
    const form = document.getElementById("product-form");

    modalTitle.textContent = "Añadir Producto";
    form.reset();

    // Configurar el formulario para añadir un nuevo producto
    form.setAttribute("data-mode", "add");
    form.setAttribute("data-id", "");

    // Rellenar select de categorías si existe
    const categorySelect = document.getElementById("product-category");
    if (categorySelect) {
      categorySelect.innerHTML =
        '<option value="">Seleccionar categoría</option>';
      AppState.categories.forEach((category) => {
        categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
      });
    }

    // Mostrar modal
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal
        .querySelector(".modal-content")
        .classList.remove("opacity-0", "translate-y-4");
      modal
        .querySelector(".modal-content")
        .classList.add("opacity-100", "translate-y-0");
    }, 10);

    // Enfocar primer campo
    setTimeout(() => {
      document.getElementById("product-name").focus();
    }, 300);
  },

  showEditProductModal(productId) {
    const product = AppState.products.find((p) => p.id === productId);
    if (!product) return;

    const modal = document.getElementById("product-modal");
    const modalTitle = modal.querySelector(".modal-title");
    const form = document.getElementById("product-form");

    modalTitle.textContent = "Editar Producto";

    // Configurar el formulario para editar un producto
    form.setAttribute("data-mode", "edit");
    form.setAttribute("data-id", productId);

    // Rellenar los campos con los datos del producto
    document.getElementById("product-name").value = product.name || "";
    document.getElementById("product-barcode").value = product.barcode || "";
    document.getElementById("product-price").value = product.price || "";
    document.getElementById("product-cost").value = product.cost || "";
    document.getElementById("product-stock").value = product.stock || "";
    document.getElementById("product-min-stock").value =
      product.min_stock || "";
    document.getElementById("product-description").value =
      product.description || "";

    // Rellenar select de categorías si existe
    const categorySelect = document.getElementById("product-category");
    if (categorySelect) {
      categorySelect.innerHTML =
        '<option value="">Seleccionar categoría</option>';
      AppState.categories.forEach((category) => {
        const selected = category.id === product.category_id ? "selected" : "";
        categorySelect.innerHTML += `<option value="${category.id}" ${selected}>${category.name}</option>`;
      });
    }

    // Mostrar modal
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal
        .querySelector(".modal-content")
        .classList.remove("opacity-0", "translate-y-4");
      modal
        .querySelector(".modal-content")
        .classList.add("opacity-100", "translate-y-0");
    }, 10);
  },

  showDeleteProductModal(productId) {
    const product = AppState.products.find((p) => p.id === productId);
    if (!product) return;

    const modal = document.getElementById("delete-confirm-modal");
    const modalTitle = modal.querySelector(".modal-title");
    const modalBody = modal.querySelector(".modal-body p");
    const confirmButton = modal.querySelector(".delete-confirm-btn");

    modalTitle.textContent = "Eliminar Producto";
    modalBody.textContent = `¿Está seguro que desea eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`;

    confirmButton.onclick = async () => {
      try {
        const result = await window.api.deleteProduct(productId);
        if (result.success) {
          this.hideModal("delete-confirm-modal");
          AppState.loadProductsData();
          this.showNotification("Producto eliminado correctamente", "success");
        } else {
          this.showNotification("Error al eliminar el producto", "error");
        }
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        this.showNotification("Error al eliminar el producto", "error");
      }
    };

    // Mostrar modal
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal
        .querySelector(".modal-content")
        .classList.remove("opacity-0", "translate-y-4");
      modal
        .querySelector(".modal-content")
        .classList.add("opacity-100", "translate-y-0");
    }, 10);
  },

  // Modales para categorías
  showAddCategoryModal() {
    const modal = document.getElementById("category-modal");
    const modalTitle = modal.querySelector(".modal-title");
    const form = document.getElementById("category-form");

    modalTitle.textContent = "Añadir Categoría";
    form.reset();

    // Configurar el formulario para añadir una nueva categoría
    form.setAttribute("data-mode", "add");
    form.setAttribute("data-id", "");

    // Mostrar modal
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal
        .querySelector(".modal-content")
        .classList.remove("opacity-0", "translate-y-4");
      modal
        .querySelector(".modal-content")
        .classList.add("opacity-100", "translate-y-0");
    }, 10);

    // Enfocar primer campo
    setTimeout(() => {
      document.getElementById("category-name").focus();
    }, 300);
  },

  showEditCategoryModal(categoryId) {
    const category = AppState.categories.find((c) => c.id === categoryId);
    if (!category) return;

    const modal = document.getElementById("category-modal");
    const modalTitle = modal.querySelector(".modal-title");
    const form = document.getElementById("category-form");

    modalTitle.textContent = "Editar Categoría";

    // Configurar el formulario para editar una categoría
    form.setAttribute("data-mode", "edit");
    form.setAttribute("data-id", categoryId);

    // Rellenar los campos con los datos de la categoría
    document.getElementById("category-name").value = category.name || "";
    document.getElementById("category-description").value =
      category.description || "";

    // Mostrar modal
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal
        .querySelector(".modal-content")
        .classList.remove("opacity-0", "translate-y-4");
      modal
        .querySelector(".modal-content")
        .classList.add("opacity-100", "translate-y-0");
    }, 10);
  },

  showDeleteCategoryModal(categoryId) {
    const category = AppState.categories.find((c) => c.id === categoryId);
    if (!category) return;

    // Verificar si hay productos en esta categoría
    const productsInCategory = AppState.products.filter(
      (p) => p.category_id === categoryId
    ).length;

    const modal = document.getElementById("delete-confirm-modal");
    const modalTitle = modal.querySelector(".modal-title");
    const modalBody = modal.querySelector(".modal-body p");
    const confirmButton = modal.querySelector(".delete-confirm-btn");

    modalTitle.textContent = "Eliminar Categoría";

    if (productsInCategory > 0) {
      modalBody.textContent = `No se puede eliminar la categoría "${category.name}" porque contiene ${productsInCategory} productos. Reasigne estos productos a otra categoría antes de eliminarla.`;
      confirmButton.style.display = "none";
      modal.querySelector(".cancel-btn").textContent = "Aceptar";
    } else {
      modalBody.textContent = `¿Está seguro que desea eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`;
      confirmButton.style.display = "block";
      confirmButton.onclick = async () => {
        try {
          const result = await window.api.deleteCategory(categoryId);
          if (result.success) {
            this.hideModal("delete-confirm-modal");
            AppState.loadCategoriesData();
            this.showNotification(
              "Categoría eliminada correctamente",
              "success"
            );
          } else {
            this.showNotification("Error al eliminar la categoría", "error");
          }
        } catch (error) {
          console.error("Error al eliminar categoría:", error);
          this.showNotification("Error al eliminar la categoría", "error");
        }
      };
      modal.querySelector(".cancel-btn").textContent = "Cancelar";
    }

    // Mostrar modal
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal
        .querySelector(".modal-content")
        .classList.remove("opacity-0", "translate-y-4");
      modal
        .querySelector(".modal-content")
        .classList.add("opacity-100", "translate-y-0");
    }, 10);
  },

  // Modal de checkout (finalizar venta)
  showCheckoutModal() {
    if (AppState.cart.length === 0) {
      this.showNotification("El carrito está vacío", "warning");
      return;
    }

    const modal = document.getElementById("checkout-modal");
    const total = AppState.cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = AppState.cart.reduce((sum, item) => {
      const itemTaxRate = item.tax_rate || AppState.settings.taxRate;
      return sum + (item.subtotal * itemTaxRate) / 100;
    }, 0);

    const finalTotal = total + tax - AppState.discount;

    // Actualizar resumen de la venta
    document.getElementById("checkout-subtotal").textContent = `${
      AppState.settings.currency
    }${total.toFixed(2)}`;
    document.getElementById("checkout-tax").textContent = `${
      AppState.settings.currency
    }${tax.toFixed(2)}`;
    document.getElementById("checkout-discount").textContent = `${
      AppState.settings.currency
    }${AppState.discount.toFixed(2)}`;
    document.getElementById("checkout-total").textContent = `${
      AppState.settings.currency
    }${finalTotal.toFixed(2)}`;

    // Resetear campos
    document.getElementById("payment-amount").value = finalTotal.toFixed(2);
    document.getElementById("payment-method").value = "cash";
    document.getElementById("payment-change").textContent = "0.00";

    // Mostrar modal
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal
        .querySelector(".modal-content")
        .classList.remove("opacity-0", "translate-y-4");
      modal
        .querySelector(".modal-content")
        .classList.add("opacity-100", "translate-y-0");
    }, 10);

    // Enfocar en el campo de monto
    setTimeout(() => {
      document.getElementById("payment-amount").focus();
      document.getElementById("payment-amount").select();
    }, 300);
  },

  // Modal de transacción completada
  showTransactionCompleteModal(transactionData) {
    const modal = document.getElementById("transaction-complete-modal");
    const receiptContainer = document.getElementById("receipt-preview");

    // Generar vista previa de recibo
    receiptContainer.innerHTML = this.generateReceiptHTML(transactionData);

    // Mostrar modal
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal
        .querySelector(".modal-content")
        .classList.remove("opacity-0", "translate-y-4");
      modal
        .querySelector(".modal-content")
        .classList.add("opacity-100", "translate-y-0");
    }, 10);
  },

  // Funciones genéricas para modales
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal
      .querySelector(".modal-content")
      .classList.add("opacity-0", "translate-y-4");
    modal
      .querySelector(".modal-content")
      .classList.remove("opacity-100", "translate-y-0");

    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);
  },

  // Generador de HTML para recibo
  generateReceiptHTML(transaction) {
    const date = new Date(transaction.created_at).toLocaleString();
    const customer = transaction.customer_name || "Cliente Ocasional";

    let receiptHTML = `
        <div class="text-center mb-4">
          <h3 class="font-bold text-lg">${AppState.settings.storeName}</h3>
          <p class="text-sm">${AppState.settings.storeAddress || ""}</p>
          <p class="text-sm">${AppState.settings.storePhone || ""}</p>
        </div>
        
        <div class="mb-4">
          <p><strong>Factura #:</strong> ${transaction.id}</p>
          <p><strong>Fecha:</strong> ${date}</p>
          <p><strong>Cliente:</strong> ${customer}</p>
          <p><strong>Cajero:</strong> ${transaction.user_name}</p>
        </div>
        
        <div class="border-t border-b border-gray-300 py-2 mb-4">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th class="text-left">Producto</th>
                <th class="text-right">Cant.</th>
                <th class="text-right">Precio</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
      `;

    transaction.items.forEach((item) => {
      receiptHTML += `
          <tr>
            <td class="text-left">${item.name}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${
              AppState.settings.currency
            }${item.price.toFixed(2)}</td>
            <td class="text-right">${
              AppState.settings.currency
            }${item.subtotal.toFixed(2)}</td>
          </tr>
        `;
    });

    receiptHTML += `
            </tbody>
          </table>
        </div>
        
        <div class="flex flex-col items-end mb-4">
          <p><strong>Subtotal:</strong> ${
            AppState.settings.currency
          }${transaction.subtotal.toFixed(2)}</p>
          <p><strong>Impuestos:</strong> ${
            AppState.settings.currency
          }${transaction.tax.toFixed(2)}</p>
          <p><strong>Descuento:</strong> ${
            AppState.settings.currency
          }${transaction.discount.toFixed(2)}</p>
          <p class="text-lg font-bold"><strong>Total:</strong> ${
            AppState.settings.currency
          }${transaction.total.toFixed(2)}</p>
          <p><strong>Pagado:</strong> ${
            AppState.settings.currency
          }${transaction.paid_amount.toFixed(2)}</p>
          <p><strong>Cambio:</strong> ${
            AppState.settings.currency
          }${transaction.change.toFixed(2)}</p>
        </div>
        
        <div class="text-center mt-6">
          <p class="text-sm">¡Gracias por su compra!</p>
        </div>
      `;

    return receiptHTML;
  },
};

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  // Verificar modo de la aplicación (servidor o cliente)
  try {
    const appMode = await window.api.getAppMode();
    AppState.setServerMode(appMode.isServer);

    if (appMode.isServer) {
      // Verificar licencia en modo servidor
      const licenseStatus = await window.api.license.verify();
      AppState.setLicenseActive(licenseStatus.valid);

      if (!licenseStatus.valid) {
        AppState.setCurrentPage("license");
      } else {
        // Verificar si hay un usuario guardado para autoacceso
        const savedUser = await window.api.auth.getSavedUser();
        if (savedUser) {
          // Auto login
          try {
            const loginResult = await window.api.auth.login(
              savedUser.username,
              savedUser.password
            );
            if (loginResult.success) {
              AppState.setCurrentUser(loginResult.user);
              AppState.setCurrentPage("dashboard");
            } else {
              AppState.setCurrentPage("login");
            }
          } catch (error) {
            console.error("Error de auto-login:", error);
            AppState.setCurrentPage("login");
          }
        } else {
          AppState.setCurrentPage("login");
        }
      }
    } else {
      // En modo cliente, mostrar pantalla de conexión
      AppState.setCurrentPage("connect");
    }
  } catch (error) {
    console.error("Error al inicializar la aplicación:", error);
    AppState.setCurrentPage("login");
  }

  // Inicializar eventos de UI global
  initializeUIEvents();

  AppState.isAppReady = true;
});

function initializeUIEvents() {
  // Event listeners para elementos comunes
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.addEventListener("click", () => {
      const page = item.getAttribute("data-page");
      AppState.setCurrentPage(page);
    });
  });

  // Event listener para botones de cierre de modales
  document.querySelectorAll(".modal-close").forEach((button) => {
    button.addEventListener("click", () => {
      const modalId = button.closest(".modal").id;
      UI.hideModal(modalId);
    });
  });

  // Listener para el botón de logout
  const logoutButton = document.getElementById("logout-btn");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await window.api.auth.logout();
        AppState.setCurrentUser(null);
        AppState.setCurrentPage("login");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    });
  }
}

// Manejar el formulario de productos
const productForm = document.getElementById("product-form");
if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recoger datos del formulario
    const mode = productForm.getAttribute("data-mode");
    const productId = productForm.getAttribute("data-id");

    const productData = {
      name: document.getElementById("product-name").value,
      barcode: document.getElementById("product-barcode").value,
      price: parseFloat(document.getElementById("product-price").value),
      cost: parseFloat(document.getElementById("product-cost").value),
      stock: parseInt(document.getElementById("product-stock").value),
      min_stock: parseInt(document.getElementById("product-min-stock").value),
      category_id: document.getElementById("product-category").value,
      description: document.getElementById("product-description").value,
    };

    try {
      let result;

      if (mode === "add") {
        // Añadir nuevo producto
        result = await window.api.addProduct(productData);
      } else if (mode === "edit") {
        // Editar producto existente
        result = await window.api.updateProduct(productId, productData);
      }

      if (result.success) {
        // Ocultar modal
        UI.hideModal("product-modal");

        // Recargar datos de productos
        AppState.loadProductsData();

        // Mostrar notificación de éxito
        UI.showNotification(
          mode === "add"
            ? "Producto añadido correctamente"
            : "Producto actualizado correctamente",
          "success"
        );
      } else {
        // Mostrar error si la operación falla
        UI.showNotification(
          result.message || "Error al guardar el producto",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
      UI.showNotification("Error al guardar el producto", "error");
    }
  });
}

// Manejar el formulario de categorías
const categoryForm = document.getElementById("category-form");
if (categoryForm) {
  categoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recoger datos del formulario
    const mode = categoryForm.getAttribute("data-mode");
    const categoryId = categoryForm.getAttribute("data-id");

    const categoryData = {
      name: document.getElementById("category-name").value,
      description: document.getElementById("category-description").value,
    };

    try {
      let result;

      if (mode === "add") {
        // Añadir nueva categoría
        result = await window.api.addCategory(categoryData);
      } else if (mode === "edit") {
        // Editar categoría existente
        result = await window.api.updateCategory(categoryId, categoryData);
      }

      if (result.success) {
        // Ocultar modal
        UI.hideModal("category-modal");

        // Recargar datos de categorías
        AppState.loadCategoriesData();

        // Mostrar notificación de éxito
        UI.showNotification(
          mode === "add"
            ? "Categoría añadida correctamente"
            : "Categoría actualizada correctamente",
          "success"
        );
      } else {
        // Mostrar error si la operación falla
        UI.showNotification(
          result.message || "Error al guardar la categoría",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      UI.showNotification("Error al guardar la categoría", "error");
    }
  });
}
