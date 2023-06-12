// Variables
const client = new MeiliSearch({
	host: "https://db.chdb.sal.web.tr",
	apiKey: "fd56d11ffea846d14f172113619a425fd980d949be887b25b9ff02874b6d99ac",
});
const index = client.index("charts");

let searchStr = "";
let searchSort = ["clicks:desc"];
let searchPage = 1;
let searchObj = {
	name: "",
	artist: "",
	album: "",
	charter: "",
};

// Functions
function generateInstrumentList(noteCounts) {
	let instrumentListHtml = ``
	let instruments = ["guitar","bass","drums","keys"]
	let difficulties = ["e","m","h","x"]
	if (noteCounts !== undefined) {
		noteCounts = JSON.parse(noteCounts)
		instruments.forEach(instrument => {
			if (noteCounts[instrument] !== undefined) {
				let difficultyHtml = ``
				difficulties.forEach(function (difficulty) {

					if (noteCounts[instrument][difficulty] !== undefined) {
						difficultyHtml = difficultyHtml.concat(difficulty).toUpperCase()
					}
				});
				let instrumentHtml = `
				<div class="col-span-1 text-center">
					<img class="mx-auto w-10 h-10 max-h-10" src="img/${instrument}.png" />
				 	<span class="text-sm" href="">${difficultyHtml}</span>
		 		</div>`
				instrumentListHtml = instrumentListHtml.concat(instrumentHtml);
			}
		});
	}


	return instrumentListHtml;
}

async function search(inputSearchStr, inputSearchPage = 1) {
	// Log Requested Search String and Page
	searchStr = inputSearchStr;
	searchPage = inputSearchPage;

	// Update Filters
	let searchFilters = updateFilters(searchObj);

	// Perform the search
	const results = await index.search(inputSearchStr, {
		page: inputSearchPage,
		hitsPerPage: 10,
		sort: searchSort,
		filter: searchFilters,
	});
	console.log(results);

	// Display the results
	const resultsList = document.getElementById("entry-parent");
	resultsList.innerHTML = "";
	results.hits.forEach((hit) => {
		// Add instruments
		instrumentListHtml = generateInstrumentList(hit.noteCounts);



		// // Check for guitar
		// if (noteCounts.guitar !== undefined) {
		// 	// Check difficulties
		// 	let difficultyList = ''
		// 	// Easy
		// 	if (noteCounts.guitar.e !== undefined) {
		// 		difficultyList = difficultyList.concat('E')
		// 	} // BURADA KALDIN, BU CONCATLERİ YUKARIDAKI FONK İÇİNDE OLUŞTURUP DÖNDÜRECEKSİN
		// 	if (noteCounts.guitar.m !== undefined) {
		// 		difficultyList = difficultyList.concat('M')
		// 	}
		// 	// Add guitar to the page
		// 	instrumentListHtml = instrumentListHtml.concat(`
		// 	<!-- GUITAR -->
		// 	<div class="col-span-1 text-center">
		// 		<img class="mx-auto max-h-10" src="img/guitar.png" />
		// 		<span class="text-sm" href="">${difficultyList}</span>
		// 	</div>
		// 	`);
		// };
		// // Check for drums
		// if (noteCounts.drums !== undefined) {
		// 	// Add drums to the page
		// 	instrumentListHtml = instrumentListHtml.concat(`
		// 	<!-- DRUMS -->
		// 	<div class="col-span-1 text-center">
		// 		<img class="mx-auto w-10 h-10 max-h-10" src="img/drums.svg" />
		// 		<span class="text-sm" href="">EMHX</span>
		// 	</div>
		// 	`);
		// };



		resultsList.innerHTML = resultsList.innerHTML.concat(`
		<!-- ENTRY -->
		<div class="rounded-lg bg-[#4e279e] px-5 py-3">
			<div class="mb-2 grid grid-cols-7">
				<!-- Info About The Song -->
				<div class="col-span-5">
					<span class="text-lg text-neutral-100">${hit.artist}</span><br />
					<span class="text">${hit.name}</span>
				</div>
				<!-- Instruments -->
				<div class="col-span-2 flex flex-row-reverse gap-1">
					${instrumentListHtml}
				</div>
			</div>
			<div class="mt-1 flex-grow border-t border-gray-200"></div>
			<span class="text"
				><a
					class="underline underline-offset-[1.5px] hover:text-violet-200"
					onclick="updateClicks(${hit.id})"
					href="${hit.link}"
					>Download ${hit.charter}'s Chart</a
				>
				<small>(${hit.clicks})</small></span
			>
		</div>`);
	});

	// Display pages
	const pagesList = document.getElementById("page-parent");
	pagesList.innerHTML = "";
	// Add Prev Button
	pagesList.innerHTML = `
    <li onclick="search(searchStr, searchPage - 1);">
      <a href="#" class="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Previous</a>
    </li>`;
	// Add Page Buttons
	for (let i = 1; i <= results.totalPages; i++) {
		// Add Active Page Button
		if (i == results.page) {
			pagesList.innerHTML = pagesList.innerHTML.concat(`
        <li onclick="search(searchStr, ${i});">
          <a href="#" class="px-3 py-2 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">${i}</a>
        </li>`);
		}
		// Add Other Page Buttons
		else {
			pagesList.innerHTML = pagesList.innerHTML.concat(`
        <li onclick="search(searchStr, ${i});">
          <a href="#" class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">${i}</a>
        </li>`);
		}
	}
	// Add Next Button
	pagesList.innerHTML = pagesList.innerHTML.concat(`
    <li onclick="search(searchStr, searchPage + 1);">
      <a href="#" class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Next</a>
    </li>`);
}

function updateFilters(inputObj) {
	inputName = inputObj.name;
	inputArtist = inputObj.artist;
	inputAlbum = inputObj.album;
	inputCharter = inputObj.charter;

	searchFilters = [];
	if (inputName !== "") {
		searchFilters.push(`name = '${inputName}'`);
	}
	if (inputArtist !== "") {
		searchFilters.push(`artist = '${inputArtist}'`);
	}
	if (inputAlbum !== "") {
		searchFilters.push(`album = '${inputAlbum}'`);
	}
	if (inputCharter !== "") {
		searchFilters.push(`charter = '${inputCharter}'`);
	}

	for (let i = 0; i < document.getElementById("hasFilter-parent").children.length; i++) {
		filterElement = document.getElementById("hasFilter-parent").children[i];
		if (filterElement.value !== "-1") {
			searchFilters.push(`${filterElement.id} = ${filterElement.value}`);
		}
	}

	let sortElement = document.getElementById("sort-search");
	if (searchSort[0] !== sortElement.value) {
		searchSort[0] = sortElement.value;
	}

	console.log(searchFilters);
	return searchFilters;
}

function updateClicks(chart_id) {
	fetch(`https://api.chdb.sal.web.tr/newclick/${chart_id}`, {
		method: "POST",
	});
}

function changeFilterButton(id) {
	button = document.getElementById(id);
	if (button.value == -1) {
		button.value = "true";
		button.classList.toggle("text-green-400");
	} else if (button.value == "true") {
		button.value = "false";
		button.classList.toggle("text-green-400");
		button.classList.toggle("text-red-400");
	} else if (button.value == "false") {
		button.value = -1;
		button.classList.toggle("text-red-400");
	}
}

function changeSortButton(id = "sort-search") {
	button = document.getElementById(id);
	if (button.value == "clicks:desc") {
		button.value = "clicks:asc";
		button.innerHTML = "Sort by: Clicks Ascending";
	} else if (button.value == "clicks:asc") {
		button.value = "length:desc";
		button.innerHTML = "Sort by: Length Descending";
	} else if (button.value == "length:desc") {
		button.value = "length:asc";
		button.innerHTML = "Sort by: Length Ascending";
	} else if (button.value == "length:asc") {
		button.value = "uploadedAt:desc";
		button.innerHTML = "Sort by: Upload Date Descending";
	} else if (button.value == "uploadedAt:desc") {
		button.value = "uploadedAt:asc";
		button.innerHTML = "Sort by: Upload Date Ascending";
	} else if (button.value == "uploadedAt:asc") {
		button.value = "clicks:desc";
		button.innerHTML = "Sort by: Clicks Descending";
	}
}

