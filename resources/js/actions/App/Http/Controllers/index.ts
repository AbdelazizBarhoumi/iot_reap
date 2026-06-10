import BrowserLogController from './BrowserLogController'
import Admin from './Admin'
import StripeWebhookController from './StripeWebhookController'
import VMSessionController from './VMSessionController'
import GuacamoleTokenController from './GuacamoleTokenController'
import ConnectionPreferencesController from './ConnectionPreferencesController'
import ProxmoxVMBrowserController from './ProxmoxVMBrowserController'
import HardwareController from './HardwareController'
import SessionCameraController from './SessionCameraController'
import SessionHardwareController from './SessionHardwareController'
import UsbDeviceReservationController from './UsbDeviceReservationController'
import CameraReservationController from './CameraReservationController'
import VMReservationController from './VMReservationController'
import ForumController from './ForumController'
import TrainingUnitVMAssignmentController from './TrainingUnitVMAssignmentController'
import AlertController from './AlertController'
import ActivityLogController from './ActivityLogController'
import VideoController from './VideoController'
import TrainingPathController from './TrainingPathController'
import TrainingPathReviewController from './TrainingPathReviewController'
import SearchController from './SearchController'
import NotificationController from './NotificationController'
import CertificateController from './CertificateController'
import CheckoutController from './CheckoutController'
import TrainingUnitNoteController from './TrainingUnitNoteController'
import QuizController from './QuizController'
import ArticleController from './ArticleController'
import TeachingController from './TeachingController'
import TeacherAnalyticsController from './TeacherAnalyticsController'
import TeacherPayoutController from './TeacherPayoutController'
import Settings from './Settings'
import AuthController from './AuthController'
import GoogleOAuthController from './GoogleOAuthController'
const Controllers = {
    BrowserLogController: Object.assign(BrowserLogController, BrowserLogController),
Admin: Object.assign(Admin, Admin),
StripeWebhookController: Object.assign(StripeWebhookController, StripeWebhookController),
VMSessionController: Object.assign(VMSessionController, VMSessionController),
GuacamoleTokenController: Object.assign(GuacamoleTokenController, GuacamoleTokenController),
ConnectionPreferencesController: Object.assign(ConnectionPreferencesController, ConnectionPreferencesController),
ProxmoxVMBrowserController: Object.assign(ProxmoxVMBrowserController, ProxmoxVMBrowserController),
HardwareController: Object.assign(HardwareController, HardwareController),
SessionCameraController: Object.assign(SessionCameraController, SessionCameraController),
SessionHardwareController: Object.assign(SessionHardwareController, SessionHardwareController),
UsbDeviceReservationController: Object.assign(UsbDeviceReservationController, UsbDeviceReservationController),
CameraReservationController: Object.assign(CameraReservationController, CameraReservationController),
VMReservationController: Object.assign(VMReservationController, VMReservationController),
ForumController: Object.assign(ForumController, ForumController),
TrainingUnitVMAssignmentController: Object.assign(TrainingUnitVMAssignmentController, TrainingUnitVMAssignmentController),
AlertController: Object.assign(AlertController, AlertController),
ActivityLogController: Object.assign(ActivityLogController, ActivityLogController),
VideoController: Object.assign(VideoController, VideoController),
TrainingPathController: Object.assign(TrainingPathController, TrainingPathController),
TrainingPathReviewController: Object.assign(TrainingPathReviewController, TrainingPathReviewController),
SearchController: Object.assign(SearchController, SearchController),
NotificationController: Object.assign(NotificationController, NotificationController),
CertificateController: Object.assign(CertificateController, CertificateController),
CheckoutController: Object.assign(CheckoutController, CheckoutController),
TrainingUnitNoteController: Object.assign(TrainingUnitNoteController, TrainingUnitNoteController),
QuizController: Object.assign(QuizController, QuizController),
ArticleController: Object.assign(ArticleController, ArticleController),
TeachingController: Object.assign(TeachingController, TeachingController),
TeacherAnalyticsController: Object.assign(TeacherAnalyticsController, TeacherAnalyticsController),
TeacherPayoutController: Object.assign(TeacherPayoutController, TeacherPayoutController),
Settings: Object.assign(Settings, Settings),
AuthController: Object.assign(AuthController, AuthController),
GoogleOAuthController: Object.assign(GoogleOAuthController, GoogleOAuthController),
}

export default Controllers