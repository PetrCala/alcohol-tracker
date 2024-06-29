import SwiftUI

struct StartSessionView: View {
    var body: some View {
        VStack {
            Button(action: {
                SessionModel.shared.startSession()
            }) {
                Text("Start Session")
            }
            Button(action: {
                // Navigate to settings
            }) {
                Text("Settings")
            }
        }
    }
}
