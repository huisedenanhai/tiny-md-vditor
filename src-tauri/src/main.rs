#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    CustomMenuItem, Error, Manager, Menu, MenuEntry, Runtime, Submenu, Window, WindowBuilder,
};

fn create_menu() -> Menu {
    let mut menu = Menu::os_default("tiny-md-editor");
    // ensure file menu
    let file_menu_index = if let Some(i) = menu.items.iter().position(|item| {
        if let MenuEntry::Submenu(submenu) = item {
            submenu.title == "File"
        } else {
            false
        }
    }) {
        i
    } else {
        menu = menu.add_submenu(Submenu::new("File", Menu::new()));
        menu.items.len() - 1
    };
    if let MenuEntry::Submenu(file_menu) = &mut menu.items[file_menu_index] {
        let mut menu = Menu::new()
            .add_item(CustomMenuItem::new("open", "Open"))
            .add_item(CustomMenuItem::new("new", "New").accelerator("Cmd + N"))
            .add_item(CustomMenuItem::new("save", "Save").accelerator("Cmd + S"));
        menu.items.append(&mut file_menu.clone().inner.items);
        file_menu.inner = menu;
    }
    menu
}

fn window_label_from_id(id: usize) -> String {
    return format!("window-{}", id).into();
}

fn get_unique_window_label<M: Manager<R>, R: Runtime>(manager: &M) -> String {
    let mut id = manager.windows().len();
    while manager
        .windows()
        .iter()
        .any(|(label, _)| label == &window_label_from_id(id))
    {
        id = id + 1;
    }
    return window_label_from_id(id);
}

fn create_new_window<M: Manager<R>, R: Runtime>(manager: &M) -> Result<Window<R>, Error> {
    let label = get_unique_window_label(manager);
    WindowBuilder::new(manager, label, tauri::WindowUrl::App("index.html".into()))
        .title("tiny-md-editor")
        .build()
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    println!("{:?}", args);
    tauri::Builder::default()
        .menu(create_menu())
        .on_menu_event(|event| match event.menu_item_id() {
            "new" => {
                create_new_window(event.window()).unwrap();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
