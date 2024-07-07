import SwiftUI

struct StartSessionView: View {
    var body: some View {
        VStack {
            Spacer()
            
            Button(action: {
                SessionModel.shared.startSession()
            }) {
                VStack {
                    Image("AppImage")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 100, height: 100)
                        .clipShape(Circle()) // Make the image round
                        // .overlay(Circle().stroke(AppColors.contrastColor, lineWidth: 4)) // Optional: Add a white border around the image

                    Text("Tap to Start Session")
                        .font(.caption) // Smaller text
                        .foregroundColor(.white)
                        .padding(.top, 8)
                }
            }
            .frame(width: 200, height: 200) // Match the button size to the image size plus text height
            .cornerRadius(100) // Round the corners of the button to match the circle image
            .buttonStyle(PlainButtonStyle()) // Make the button invisible
    
            Spacer()
        }
    }
}
