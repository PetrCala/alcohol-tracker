import SwiftUI

struct SettingsView: View {
    @State private var someSetting: Bool = false

    var body: some View {
        Form {
            Toggle(isOn: $someSetting) {
                Text("Some Setting")
            }
        }
    }
}
