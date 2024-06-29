import WatchKit
import Foundation

class UnitSelectionController: WKInterfaceController {
    @IBOutlet var unitPicker: WKInterfacePicker!
    
    let units = ["Unit 1", "Unit 2", "Unit 3"]
    var selectedUnit: String?

    override func awake(withContext context: Any?) {
        super.awake(withContext: context)
        loadUnits()
    }

    func loadUnits() {
        var pickerItems: [WKPickerItem] = []
        for unit in units {
            let item = WKPickerItem()
            item.title = unit
            pickerItems.append(item)
        }
        unitPicker.setItems(pickerItems)
    }

    @IBAction func unitPickerChanged(_ value: Int) {
        selectedUnit = units[value]
        // Perform additional actions based on the selected unit
    }
}
