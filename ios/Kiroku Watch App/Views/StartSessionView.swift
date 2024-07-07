import SwiftUI

struct StartSessionView: View {
    var body: some View {
        VStack {
            Spacer()
            
            Button(action: {
                SessionModel.shared.startSession()
            }) {
                Image("AppImage")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 100, height: 100)
                    .clipShape(Circle()) // Make the image round
                    // .overlay(Circle().stroke(AppColors.contrastColor, lineWidth: 4)) // Optional: Add a white border around the image
            }
            .buttonStyle(PlainButtonStyle()) // Make the button invisible
    
            Text("Tap to Start Session")
                .font(.caption) // Smaller text
                .foregroundColor(.white)
                .padding(.top, 8)
            
            Spacer()
        }
    }
}
