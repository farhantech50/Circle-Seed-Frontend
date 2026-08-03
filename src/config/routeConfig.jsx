import About from "../website/pages/About";
import Careers from "../website/pages/Careers";
import Contact from "../website/pages/Contact";
import CSR from "../website/pages/CSR";
import Events from "../website/pages/Events";
import Home from "../website/pages/Home";
import Infrastructure from "../website/pages/Infrastructure";
import News from "../website/pages/News";
import Partnership from "../website/pages/Partnership";
import Products from "../website/pages/Products";

import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import EmployeeDashboard from "../pages/Dashboard/EmployeeDashboard";
import LiveTrackingMap from "../pages/Dashboard/LiveTrackingMap";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ResetPassword from "../pages/auth/ResetPassword";
import Employees from "../pages/HR/Employees/Employees";
import AccessDenied from "../pages/Landing/AccessDenied";
import NotFound from "../pages/Landing/NotFound";
import Setup from "../pages/HR/Setup/Setup";
import Weekend from "../pages/HR/Setup/Weekend/Weekend";
import Holiday from "../pages/HR/Setup/Holiday/Holiday";
import RolesPermissions from "../pages/HR/RolesPermissions/RolesPermissions";
import LeaveQuota from "../pages/HR/Setup/LeaveQuota/LeaveQuota";
import Attendance from "../pages/HR/Attendance/Attendance";
import AttendanceSummary from "../pages/HR/Attendance/AttendanceSummary";
import Overtime from "../pages/HR/Attendance/Overtime";
import LeaveRequests from "../pages/HR/LeaveManagement/LeaveRequests";
import PendingApprovals from "../pages/HR/LeaveManagement/PendingApprovals";
import Salary from "../pages/HR/Setup/Salary/Salary";
import Payroll from "../pages/HR/Payroll/Payroll";
import PayrollApprovals from "../pages/HR/Payroll/PayrollApprovals";
import MyPayslips from "../pages/HR/Payroll/MyPayslips";
import Supplier from "../pages/Procurement/Supplier/Supplier";
import PreOrders from "../pages/Procurement/PreOrders/PreOrders";
import LocalPurchase from "../pages/Procurement/LocalPurchase/LocalPurchase";
import Import from "../pages/Procurement/Import/Import";
import GoodsReceived from "../pages/Procurement/GoodsReceived/GoodsReceived";
import GoodsReceivedApprovals from "../pages/Procurement/GoodsReceived/GoodsReceivedApprovals";
import Locations from "../pages/HR/Setup/Location/Location";
import POSLocation from "../pages/HR/Setup/POSLocation/POSLocation";
import SalesTarget from "../pages/HR/Setup/SalesTarget/SalesTarget";
import MarketingTarget from "../pages/HR/Setup/MarketingTarget/MarketingTarget";
import InventoryOverall from "../pages/Inventory/InventoryOverall";
import InventoryDetails from "../pages/Inventory/InventoryDetails/InventoryDetails";
import DamageLoss from "../pages/Inventory/DamageLoss/DamageLoss";
import QuotationCalculator from "../pages/Inventory/QuotationCalculator/QuotationCalculator";

import POS from "../pages/Sales/POS/POS";
import POSOrdersHistory from "../pages/Sales/POS/POSOrdersHistory";
import BulkSales from "../pages/Sales/BulkSales/BulkSales";
import BulkSalesOrdersHistory from "../pages/Sales/BulkSales/BulkSalesOrdersHistory";
import PackagedSales from "../pages/Sales/PackagedSales/PackagedSales";
import PackagedSalesOrdersHistory from "../pages/Sales/PackagedSales/PackagedSalesOrdersHistory";
import PartialInvoices from "../pages/Sales/PartialInvoices/PartialInvoices";
import AllInvoices from "../pages/Sales/AllInvoices/AllInvoices";
import PaymentsMade from "../pages/Accounts/PaymentsMade/PaymentsMade";
import PaymentsReceived from "../pages/Accounts/PaymentsReceived/PaymentsReceived";
import Expenses from "../pages/Accounts/Expenses/Expenses";
import Ledger from "../pages/Accounts/Ledger/Ledger";
import Leads from "../pages/Marketing/Leads/Leads";
import FollowUp from "../pages/Marketing/FollowUp/FollowUp";
import MarketUpdates from "../pages/Marketing/MarketUpdates/MarketUpdates";
import VisitAssignment from "../pages/Marketing/VisitAssignment/VisitAssignment";
import SalesReports from "../pages/Reports/SalesReports/SalesReports";
import InventoryReports from "../pages/Reports/InventoryReports/InventoryReports";
import ProcurementReports from "../pages/Reports/ProcurementReports/ProcurementReports";
import KpiReports from "../pages/Reports/KpiReports/KpiReports";

const Empty = () => (
  <div className="p-4 text-gray-500">Module Component Coming Soon...</div>
);

export const websiteRoutes = [
  { path: "/", element: Home },
  { path: "/about", element: About },
  { path: "/infrastructure", element: Infrastructure },
  { path: "/products", element: Products },
  { path: "/news", element: News },
  { path: "/events", element: Events },
  { path: "/careers", element: Careers },
  { path: "/csr", element: CSR },
  { path: "/partnership", element: Partnership },
  { path: "/contact", element: Contact },
];

export const publicRoutes = [
  {
    path: "/login",
    element: Login,
  },
  {
    path: "/register",
    element: Register,
  },
  {
    path: "/forgot-password",
    element: ForgotPassword,
  },
  {
    path: "/reset-password",
    element: ResetPassword,
  },
];

export const protectedRoutes = [
  { path: "/dashboard/super-admin", element: AdminDashboard },
  { path: "/dashboard/admin", element: AdminDashboard },
  { path: "/dashboard/employee", element: EmployeeDashboard },
  { path: "/dashboard/factory-&-production-manager", element: EmployeeDashboard },
  { path: "/dashboard/factory-&-production-executive", element: EmployeeDashboard },
  { path: "/dashboard/inventory-manager", element: EmployeeDashboard },
  { path: "/dashboard/inventory-executive", element: EmployeeDashboard },
  { path: "/dashboard/sales-manager", element: EmployeeDashboard },
  { path: "/dashboard/sales-executive", element: EmployeeDashboard },
  { path: "/dashboard/accounts-manager", element: EmployeeDashboard },
  { path: "/dashboard/accounts-executive", element: EmployeeDashboard },
  { path: "/dashboard/marketing-manager", element: EmployeeDashboard },
  { path: "/dashboard/marketing-executive", element: EmployeeDashboard },
  { path: "/dashboard/hr-manager", element: EmployeeDashboard },
  { path: "/dashboard/hr-executive", element: EmployeeDashboard },
  { path: "/dashboard/pos-user", element: EmployeeDashboard },
  { path: "/dashboard/live-tracking", element: LiveTrackingMap },

  { path: "/hr/setup", element: Setup },
  { path: "/hr/setup/holiday", element: Holiday },
  { path: "/hr/setup/weekend", element: Weekend },
  { path: "/hr/setup/attendance-location", element: Locations },
  { path: "/hr/setup/salary", element: Salary },
  { path: "/hr/setup/leave-quota", element: LeaveQuota },
  { path: "/hr/setup/pos-location", element: POSLocation },
  { path: "/hr/setup/sales-target", element: SalesTarget },
  { path: "/hr/setup/marketing-target", element: MarketingTarget },
  { path: "/hr/employees", element: Employees },
  { path: "/hr/attendance", element: Attendance },
  { path: "/hr/attendance-summary", element: AttendanceSummary },
  { path: "/hr/overtime", element: Overtime },
  { path: "/hr/leaves/requests", element: LeaveRequests },
  { path: "/hr/leaves/approvals", element: PendingApprovals },
  { path: "/hr/payroll", element: Payroll },
  { path: "/hr/payroll/approvals", element: PayrollApprovals },
  { path: "/hr/payroll/payslips", element: MyPayslips },
  { path: "/hr/permissions", element: RolesPermissions },

  { path: "/sales/pos", element: POS },
  { path: "/sales/pos-history", element: POSOrdersHistory },
  { path: "/sales/packaged", element: PackagedSales },
  { path: "/sales/packaged-history", element: PackagedSalesOrdersHistory },
  { path: "/sales/bulk", element: BulkSales },
  { path: "/sales/bulk-history", element: BulkSalesOrdersHistory },
  { path: "/sales/partial-invoices", element: PartialInvoices },
  { path: "/sales/invoices", element: AllInvoices },
  { path: "/sales/customers", element: Empty },
  { path: "/sales/export", element: Empty },

  { path: "/inventory", element: InventoryOverall },
  { path: "/inventory/damage-loss", element: DamageLoss },
  { path: "/inventory/quotation-calculator", element: QuotationCalculator },
  { path: "/inventory/:seedTypeId", element: InventoryDetails },

  { path: "/procurement/suppliers", element: Supplier },
  { path: "/procurement/pre-orders", element: PreOrders },
  { path: "/procurement/local-purchase", element: LocalPurchase },
  { path: "/procurement/import", element: Import },
  { path: "/procurement/goods-received", element: GoodsReceived },
  {
    path: "/procurement/goods-received-approvals",
    element: GoodsReceivedApprovals,
  },

  { path: "/accounts/invoices", element: AllInvoices },
  { path: "/accounts/payments-received", element: PaymentsReceived },
  { path: "/accounts/payments-made", element: PaymentsMade },
  { path: "/accounts/expenses", element: Expenses },
  { path: "/accounts/profit-loss", element: Empty },
  { path: "/accounts/ledger", element: Ledger },

  { path: "/marketing/leads", element: Leads },
  { path: "/marketing/market-updates", element: MarketUpdates },
  { path: "/marketing/staff-assignment", element: Empty },
  { path: "/marketing/visit-management", element: VisitAssignment },
  { path: "/marketing/follow-up", element: FollowUp },

  { path: "/reports/sales", element: SalesReports },
  { path: "/reports/inventory", element: InventoryReports },
  { path: "/reports/procurement", element: ProcurementReports },
  { path: "/reports/kpi", element: KpiReports },
  { path: "/reports/profit-loss", element: Empty },
];

export const errorRoutes = [
  {
    path: "/unauthorized",
    element: AccessDenied,
  },
  {
    path: "*",
    element: NotFound,
  },
];
