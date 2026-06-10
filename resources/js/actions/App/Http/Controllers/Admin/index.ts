import AdminUserController from './AdminUserController'
import ProxmoxServerController from './ProxmoxServerController'
import AdminAnalyticsController from './AdminAnalyticsController'
import AdminTrainingPathController from './AdminTrainingPathController'
import AdminVMAssignmentController from './AdminVMAssignmentController'
import ProxmoxNodeController from './ProxmoxNodeController'
import AdminReservationController from './AdminReservationController'
import AdminVMReservationController from './AdminVMReservationController'
import AdminCameraController from './AdminCameraController'
import AdminFinanceController from './AdminFinanceController'
import AdminRefundController from './AdminRefundController'
import AdminPayoutController from './AdminPayoutController'
import MaintenanceController from './MaintenanceController'
const Admin = {
    AdminUserController: Object.assign(AdminUserController, AdminUserController),
ProxmoxServerController: Object.assign(ProxmoxServerController, ProxmoxServerController),
AdminAnalyticsController: Object.assign(AdminAnalyticsController, AdminAnalyticsController),
AdminTrainingPathController: Object.assign(AdminTrainingPathController, AdminTrainingPathController),
AdminVMAssignmentController: Object.assign(AdminVMAssignmentController, AdminVMAssignmentController),
ProxmoxNodeController: Object.assign(ProxmoxNodeController, ProxmoxNodeController),
AdminReservationController: Object.assign(AdminReservationController, AdminReservationController),
AdminVMReservationController: Object.assign(AdminVMReservationController, AdminVMReservationController),
AdminCameraController: Object.assign(AdminCameraController, AdminCameraController),
AdminFinanceController: Object.assign(AdminFinanceController, AdminFinanceController),
AdminRefundController: Object.assign(AdminRefundController, AdminRefundController),
AdminPayoutController: Object.assign(AdminPayoutController, AdminPayoutController),
MaintenanceController: Object.assign(MaintenanceController, MaintenanceController),
}

export default Admin