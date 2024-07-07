//
//  StartSessionContent.swift
//  Kiroku Watch App
//
//  Created by PetrCala on 07.07.2024.
//

import Foundation
import SwiftUI

struct StartSessionContent: View {
    @ObservedObject var viewModel: SessionViewModel
    @Binding var navigateToMainScreen: Bool
    
    var body: some View {
        VStack {
            Spacer()
            
            Button(action: {
                viewModel.startSession()
                navigateToMainScreen = true
            }) {
                VStack {
                    Image(ImageAssets.AppImage)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 100, height: 100)
                        .clipShape(Circle()) // Make the image round
                        // .overlay(Circle().stroke(AppColors.contrastColor, lineWidth: 4)) // Optional: Add a white border around the image

                    Text(Translate.getText(for: "tapToStartSession"))
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

struct StartSessionContent_Previews: PreviewProvider {
    @State static var navigateToMainScreen = false
    static var previews: some View {
        StartSessionContent(viewModel: SessionViewModel(), navigateToMainScreen: $navigateToMainScreen)
    }
}
