import SwiftUI

struct MainScreenView: View {
    @ObservedObject var viewModel: SessionViewModel

    var body: some View {
        VStack {
          Text("\(viewModel.session.unitCount)")
                .font(.largeTitle)
            HStack {
                Button(action: {
                    viewModel.addUnit()
                }) {
                    Text("+")
                        .font(.largeTitle)
                        .padding()
                }
                Button(action: {
                    viewModel.subtractUnit()
                }) {
                    Text("-")
                        .font(.largeTitle)
                        .padding()
                }
            }
        }
        // .navigationBarTitle("Main Screen")
    }
}

struct MainScreenView_Previews: PreviewProvider {
    static var previews: some View {
        MainScreenView(viewModel: SessionViewModel())
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
