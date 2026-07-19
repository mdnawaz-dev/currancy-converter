const BASE_URL = "https://api.exchangerate.host/latest?base=";

const dropdowns = document.querySelectorAll(".dropdownselect");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");



for(let select of dropdowns) {
  for (let currCode in countryList) {
    let countryCode = countryList[currCode];
    let countryName = countryNames[countryCode];
    let newOption = document.createElement("option");
    newOption.innerText = `${currCode} - ${countryName}`;
    newOption.value = currCode;
    if (select.name === "from" && currCode === "USD") {
      newOption.selected = "selected";
    } else if (select.name === "to" && currCode === "INR") {
      newOption.selected = "selected";
    }
    select.append(newOption);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
  });
}

const updateExchangeRate =  async () => {
  let amount = document.querySelector(".Amount input");
  let amtVal = parseFloat(amount.value);
  if (amtVal === "" || amtVal <= 0) {
    amtVal = 1;
    amount.value = "1";
  }

  // console.log(fromCurr.value, toCurr.value);
  const URL = `${BASE_URL}${encodeURIComponent(fromCurr.value)}&symbols=${encodeURIComponent(toCurr.value)}`;
  let response = await fetch(URL);
  let data = await response.json();
  console.log('Fetched URL:', URL);
  console.log('API response:', data);

  let rate = null;
  if (data && data.rates && typeof data.rates[toCurr.value] === 'number') {
    rate = data.rates[toCurr.value];
  } else if (data && data.success === false && data.error) {
    console.warn('Primary API returned error:', data.error);
  }

  // Fallback: try a second public API if primary didn't return a usable rate
  if (!rate) {
    const fbURL = `https://open.er-api.com/v6/latest/${encodeURIComponent(fromCurr.value)}`;
    try {
      let fbResp = await fetch(fbURL);
      let fbData = await fbResp.json();
      console.log('Fallback URL:', fbURL);
      console.log('Fallback response:', fbData);
      if (fbData && fbData.rates && typeof fbData.rates[toCurr.value] === 'number') {
        rate = fbData.rates[toCurr.value];
      }
    } catch (err) {
      console.warn('Fallback fetch failed:', err);
    }
  }

  if (!rate) {
    console.warn('Rate not found in any API response');
    msg.innerText = 'Exchange rate unavailable';
    return;
  }

  let finalAmount = (amtVal * rate).toFixed(2);
  msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;

};

const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode];
  let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
  let img = element .parentElement.querySelector("img");
  img.src = newSrc; 

  };


btn.addEventListener("click",(evt) => {
  evt.preventDefault();
  updateExchangeRate();
});


window.addEventListener("load", () => {
 updateExchangeRate();
});