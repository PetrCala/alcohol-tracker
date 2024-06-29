import WatchKit
import Foundation

class MainScreenController: WKInterfaceController {
    @IBOutlet var unitLabel: WKInterfaceLabel!
    @IBOutlet var addButton: WKInterfaceButton!
    @IBOutlet var subtractButton: WKInterfaceButton!

    var unitCount = 0

    override func awake(withContext context: Any?) {
        super.awake(withContext: context)
        updateUnitLabel()
    }

    @IBAction func addUnit() {
        unitCount += 1
        updateUnitLabel()
    }

    @IBAction func subtractUnit() {
        if unitCount > 0 {
            unitCount -= 1
        }
        updateUnitLabel()
    }

    func updateUnitLabel() {
        unitLabel.setText("\(unitCount) Units")
    }
}

// class MainScreenController: WKInterfaceController {

//     override func awake(withContext context: Any?) {
//         super.awake(withContext: context)
//         observeSessionState()
//     }

//     func observeSessionState() {
//         let userId = Auth.auth().currentUser?.uid ?? "defaultUserId"
//         let sessionRef = Database.database().reference().child("sessions").child(userId)
        
//         sessionRef.observe(.value, with: { snapshot in
//             if let sessionData = snapshot.value as? [String: Any], let isActive = sessionData["isActive"] as? Bool {
//                 if !isActive {
//                     // Handle session end
//                     self.popToRootController()
//                 }
//             }
//         })
//     }
// }
