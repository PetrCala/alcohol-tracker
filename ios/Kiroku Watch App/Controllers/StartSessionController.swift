import WatchKit
import Foundation

class StartSessionController: WKInterfaceController {
    @IBAction func startNewSession() {
        SessionModel.shared.startSession()
        pushController(withName: "MainScreenView", context: nil)
    }

    // @IBAction func navigateToSettings() {
    //     pushController(withName: "SettingsScreen", context: nil)
    // }
}
