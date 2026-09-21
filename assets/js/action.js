var usefacInfo = [];

// import * as XLSX from 'xlsx';
document.addEventListener("DOMContentLoaded", () => {
		
	var StandardTab = document.getElementById('StandardTab');
	var SaaSTab = document.getElementById('SaaSTab');
	var EtcTab = document.getElementById('EtcTab');

	var MenuButton = document.getElementById('btnMenu');
	var Menu = document.getElementById('MENU');
	var AddFav = document.getElementById('addfav');

	var searchText = document.getElementById('searchText');

	StandardTab.addEventListener('click', (e) => {
		StandardTab.parentNode.classList.add('current');
		SaaSTab.parentNode.classList.remove('current');
		EtcTab.parentNode.classList.remove('current');

		document.getElementById('SaaSSection').style.display = 'none';
		document.getElementById('EtcSection').style.display = 'none';
		document.getElementById('StandardSection').style.display = 'block';
	});

	SaaSTab.addEventListener('click', (e) => {
		SaaSTab.parentNode.classList.add('current');
		StandardTab.parentNode.classList.remove('current');
		EtcTab.parentNode.classList.remove('current');

		document.getElementById('SaaSSection').style.display = 'block';
		document.getElementById('StandardSection').style.display = 'none';
		document.getElementById('EtcSection').style.display = 'none';
	});

	EtcTab.addEventListener('click', (e) => {
		EtcTab.parentNode.classList.add('current');
		SaaSTab.parentNode.classList.remove('current');
		StandardTab.parentNode.classList.remove('current');

		document.getElementById('StandardSection').style.display = 'none';
		document.getElementById('SaaSSection').style.display = 'none';
		document.getElementById('EtcSection').style.display = 'block';
	});

	// AddFav.addEventListener('click', (e) => {
	// 	addFavorite();
	// 	alert("즐겨찾기 추가")
	// });

	var logUserId = document.getElementById('logUserId');

	function updateLogLinks() {
		var id = logUserId.value.trim() || 'shrimp4277';
		document.querySelectorAll('.log-link').forEach(function(link) {
			link.href = link.dataset.logBase + id;
		});
	}

	logUserId.addEventListener('input', updateLogLinks);
	updateLogLinks();

	markWrappedButtons($("#EtcSection"));

	function runSearch() {
		var searchValue = searchText.value;

		var arrIdx = usefacInfo.findIndex(function(el) { return el.NAME.indexOf(searchValue) > -1 });

		var infoUl = $("#infoUl");
		infoUl.find("li").remove();
		$(".link-list li.search-match").each(function() {
			stopSearchRainbow(this);
		}).removeClass("search-match");

		if(arrIdx < 0 || !!! searchValue || searchValue == "") return null;

		var gubun = usefacInfo[arrIdx].GUBUN;
		var name = usefacInfo[arrIdx].NAME;
		var db = usefacInfo[arrIdx].DB;
		var was = usefacInfo[arrIdx].WAS;
		var url = usefacInfo[arrIdx].URL;
		var server1 = usefacInfo[arrIdx].SERVER1;
		var server2 = usefacInfo[arrIdx].SERVER2;
		var univCd = usefacInfo[arrIdx].UNIV_CD;

		if(gubun == "SaaS") {
			SaaSTab.click();
		} else if(gubun == "Standard") {
			StandardTab.click();
		}

		var liStr = "";
		liStr += "<li class=\"info\">GUBUN : " + gubun+"</li>";
		liStr += "<li class=\"info\">NAME : " + name+"</li>";
		if(gubun != "Standard") {
			liStr += "<li class=\"info\">DB : " + db+"</li>";
			liStr += "<li class=\"info\">WAS : " + was+"</li>";
			liStr += "<li class=\"info\">SERVER1 : " + server1+"</li>";
			liStr += "<li class=\"info\">SERVER2 : " + server2+"</li>";
		} else {
			liStr += "<li class=\"info\">UNIV_CD : " + univCd+"</li>";
		}
		infoUl.append(liStr);

		$(".link-list li").filter(function() { return $(this).data("name") === name; }).each(function() {
			this.classList.add("search-match");
			startSearchRainbow(this);
		});

		return url;
	}

	searchText.addEventListener('input', () => {
		runSearch();
	});

	searchText.addEventListener('keydown', (e) => {
		if((e.code == "Enter" || e.code == "NumpadEnter") && !e.isComposing) {
			var url = runSearch();
			if(url) window.open(url);
		}
	});

	//엑셀에서 기관리스트 읽어오기
	(async () => {
		let response = await fetch("./univTest.xlsx");
		// let t_xml = await response.text(); // 텍스트 형태로 가져오고

		const buffer = await response.arrayBuffer();
		// var reader = new FileReader();
		const univList= XLSX.read(buffer, {type: 'array'});

		const parsingExcel = parseXLSX(univList);
	})();

});

const parseXLSX = (univList) => {
	univList.SheetNames.forEach(function(sheetName,idx){
		var sheet = univList.Sheets[univList.SheetNames[idx]];
		const rows = XLSX.utils.sheet_to_json(sheet);

		var rowsArea = $("#"+sheetName+"Section").find(".rows");

		var groups = {};
		var groupServer2 = {};
		var groupIp1 = {};
		var groupIp2 = {};
		var groupOrder = [];

		rows.forEach((row,idx) => {
			const name		= row['기관명'];
			const db		= row['DB'];
			const was		= row['WAS'];
			const url		= row['URL'] + "rsysmng_login.act";
			const server1	= row['SERVER1'];
			const server2	= row['SERVER2'];
			const ip1		= row['IP1'];
			const ip2		= row['IP2'];
			const univCd	= row['UNIV_CD'];
			const gubun		= row['구분'];

			var label = name;
			if(sheetName == "Standard") label = "("+univCd+ ")" + name;
			else if(sheetName == "SaaS") label = "<span class=\"db-tag\">("+db+ ")</span>" + name;

			var safeName = String(name).replace(/"/g, "&quot;");
			var liStr = "<li data-name=\"" + safeName + "\"><a class=\"icon fa-folder\" href=\"" + url + "\" target=\"_blank\"><span>" + label +"</span></a></li>";

			var groupKey = (sheetName == "SaaS") ? server1 : "all";
			if(!(groupKey in groups)) {
				groups[groupKey] = "";
				groupServer2[groupKey] = server2;
				groupIp1[groupKey] = ip1;
				groupIp2[groupKey] = ip2;
				groupOrder.push(groupKey);
			}
			groups[groupKey] += liStr;

			usefacInfo.push({
				GUBUN:gubun
				,NAME:name
				,DB:db
				,WAS:was
				,URL:url
				,SERVER1:server1
				,SERVER2:server2
				,UNIV_CD:univCd
			});

			// if(!! name && name.indexOf(searchValue) > -1) console.log("찾음");
		});

		if(sheetName == "SaaS") {
			groupOrder.sort(function(a,b){ return a - b; });

			var html = "";
			groupOrder.forEach(function(key) {
				html += "<div class=\"link-group link-group-full\">";
				html += "<h4 class=\"link-group-title\">SERVER : " + key + ", " + groupServer2[key] + " | " + groupIp1[key] + ", " + groupIp2[key] + "</h4>";
				html += "<ul class=\"link-list SaaS\">" + groups[key] + "</ul>";
				html += "</div>";
			});

			rowsArea.append(html);
		} else {
			rowsArea.append("<ul class=\"link-list "+sheetName+"\">" + groups["all"] + "</ul>");
		}

		markWrappedButtons(rowsArea);
	})

};

function markWrappedButtons(scope) {
	scope.find("li a.icon.fa-folder").each(function() {
		var label = this.querySelector("span");
		var lineHeight = parseFloat(getComputedStyle(label).lineHeight);
		if(label.offsetHeight > lineHeight * 1.5) {
			this.closest("li").classList.add("is-wrapped");
		}
	});
}

// function addFavorite() {
// 	var title = "";
// 	var url = "";
// 	confirm("진짜?");
// 	$(".premiums li a").each(function (index, element){
// 		title = $(this).text();
// 		url = $(this).attr('href');
// 		window.external.addFavorite(url, title);
// 	})
//
// }
function searchTarget(searchValue) {
	var allList = document.getElementsByTagName("a");
	var count = 0;
	var href = "";

	for(var i = 0; i < allList.length; i++){
		if(allList[i].innerHTML.indexOf(searchValue)>-1){
			count++;
			href = allList[i].href;
		}
	}
	if (count == 1) {
		window.open(href);
	} else if (count > 1){
		alert("검색된 기관 " + count + "개");
	}
}

(function () {
	document.addEventListener('mouseover', function (e) {
		const el = e.target.closest('a');
		if (!el || !el.classList.contains('twinkle') || el._colorTimer) return;
		el._origColor = el.style.color;
		el._hue = 0;
		el._colorTimer = setInterval(function () {
			el.style.color = `hsl(${el._hue},90%,50%)`;
			el._hue = (el._hue + 5) % 360;
		}, 30);
	});

	document.addEventListener('mouseout', function (e) {
		const el = e.target.closest('a');
		if (!el || !el.classList.contains('twinkle') || !el._colorTimer) return;
		if (el.contains(e.relatedTarget)) return;
		clearInterval(el._colorTimer);
		el._colorTimer = null;
		el.style.color = el._origColor;
	});
})();

function startSearchRainbow(li) {
	var el = li.querySelector('a.icon.fa-folder');
	if (!el || el._searchColorTimer) return;
	el._searchHue = 0;
	el._searchColorTimer = setInterval(function () {
		el.style.setProperty('--search-match-color', `hsl(${el._searchHue},85%,50%)`);
		el.style.setProperty('--search-match-shadow', `hsla(${el._searchHue},85%,50%,0.45)`);
		el._searchHue = (el._searchHue + 5) % 360;
	}, 30);
}

function stopSearchRainbow(li) {
	var el = li.querySelector('a.icon.fa-folder');
	if (!el || !el._searchColorTimer) return;
	clearInterval(el._searchColorTimer);
	el._searchColorTimer = null;
	el.style.removeProperty('--search-match-color');
	el.style.removeProperty('--search-match-shadow');
}


