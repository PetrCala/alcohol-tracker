import WatchKit
import Foundation

class SessionControlController: WKInterfaceController {
    let session = SessionModel.shared

    @IBAction func endSession() {
        session.endSession()
        // Navigate back to the Start Session Screen or show a confirmation
        popToRootController()
    }

    @IBAction func cancelSession() {
        session.endSession()
        // Navigate back to the Start Session Screen or show a confirmation
        popToRootController()
    }
}


// class SessionManager {

//     static let shared = SessionManager()
//     private let sessionRef = Database.database().reference().child("sessions")

//     private init() { }

//     func startSession(for userId: String, completion: @escaping (Error?) -> Void) {
//         let userSessionRef = sessionRef.child(userId)
//         userSessionRef.observeSingleEvent(of: .value, with: { snapshot in
//             if let sessionData = snapshot.value as? [String: Any], sessionData["isActive"] as? Bool == true {
//                 completion(NSError(domain: "SessionError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Another session is already active."]))
//             } else {
//                 userSessionRef.setValue(["isActive": true, "startTime": Date().timeIntervalSince1970])
//                 completion(nil)
//             }
//         })
//     }

//     func endSession(for userId: String, completion: @escaping (Error?) -> Void) {
//         let userSessionRef = sessionRef.child(userId)
//         userSessionRef.updateChildValues(["isActive": false, "endTime": Date().timeIntervalSince1970]) { error, _ in
//             completion(error)
//         }
//     }
// }
