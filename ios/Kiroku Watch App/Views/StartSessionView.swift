import SwiftUI

struct StartSessionView: View {
    var body: some View {
        VStack {
            Button(action: {
                SessionModel.shared.startSession()
            }) {
                Text("Tap to Start Session")
            }
        }
    }
}
