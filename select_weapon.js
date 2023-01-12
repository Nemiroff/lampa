(function () {
    'use strict';

	function startSwitchMouse() {
		window.switch_mouse = true;
		if(Lampa.Platform.is("android") && !Lampa.Storage.get("weapon_choised", "false")){
			let html = Lampa.Template.get('lang_choice', {})
			let scroll = new Lampa.Scroll({mask:true, over:true})

			function btn(name, select){
				let item = $('<div class="selector lang__selector-item">'+name+'</div>')
				item.on('hover:enter',(e)=>{
					if(select) select()
				}).on('hover:focus',(e)=>{
					scroll.update($(e.target), true)
				}).on('click',()=>{
					if(select && Lampa.DeviceInput.canClick()) select()
				})
				scroll.append(item)
			}

			function dpad(){
				Lampa.Storage.set("navigation_type", "controller")
				Lampa.Storage.set("is_true_mobile", "false")
				close()
			}
			function mouse(){
				Lampa.Storage.set("navigation_type", "mouse")
				Lampa.Storage.set("is_true_mobile", "true")
				close()
			}
			function touch(){
				Lampa.Storage.set("navigation_type", "controller")
				Lampa.Storage.set("is_true_mobile", "true")
				close()
			}

			function close(){
				Lampa.Storage.set("weapon_choised", "true")
				window.location.reload()
			}

			let btns = [
				{
					name: "Пульт без мышки",
					select: dpad
				},
				{
					name: "Мышь / Пульт с мышью",
					select: mouse
				},
				{
					name: "Тачскрин",
					select: touch
				}
			]
			
			btns.forEach((item)=>{
				btn(item.name, item.select)
			})
			html.find('.lang__selector').append(scroll.render())
			$('body').append(html)

			Lampa.Controller.add('select_weapon',{
				toggle: ()=>{
					Lampa.Controller.collectionSet(scroll.render())
					Lampa.Controller.collectionFocus(false,scroll.render())
				},
				up: ()=>{
					Lampa.Navigator.move('up')
				},
				down: ()=>{
					Lampa.Navigator.move('down')
				}
			})

			Lampa.Controller.toggle('select_weapon')
		}
	}

	if (!window.switch_mouse) startSwitchMouse();

})();
