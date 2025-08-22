// ❶ 把下面换成你的 Apps Script Web App URL（以 /exec 结尾）
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwdHWLxSWkYFwp3NqdQacvihJ87RQ2jvf0Q0di2hix_PyvLDxp4-Jq3CXiMszqB_Mlf/exec';

const $ = sel => document.querySelector(sel);

const EXAMPLES = [
  '列出 FLEXPLM_DB11 中按 price 降序的前 10 条，显示 product_id, price',
  '统计每个 brand 的产品数量，按数量降序取前 10',
  '查找 updated_at 在最近 30 天的数据，显示 product_id, brand, updated_at，按 updated_at 降序取前 10'
];

function renderExamples() {
  const box = $('#examples');
  EXAMPLES.forEach(text => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = text;
    chip.addEventListener('click', () => { $('#q').value = text; });
    box.appendChild(chip);
  });
}

async function runQuery() {
  const q = $('#q').value.trim();
  $('#error').textContent = '';
  $('#result').innerHTML = '';
  $('#sql').textContent = '';
  $('#summary').textContent = '';
  $('#status').textContent = '查询中…';

  if (!q) {
    $('#status').textContent = '';
    $('#error').textContent = '请输入问题';
    return;
  }

  try {
    // 用 GET 避免预检；请确保 Web App 访问权限设置为“Anyone with the link”
    const url = ENDPOINT + '?q=' + encodeURIComponent(q);
    console.log(url)
    const resp = await fetch(url, { method: 'GET' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data = await resp.json();
    if (!data.ok) throw new Error(data.error || 'Unknown error');

    $('#summary').textContent = data.summary || '';
    $('#sql').textContent = data.sql || '';

    const { fields = [], rows = [] } = data.result || {};
    if (!fields.length) {
      $('#result').innerHTML = '<p class="status">无数据</p>';
      return;
    }
    const table = renderTable(fields, rows);
    $('#result').appendChild(table);
  } catch (err) {
    $('#error').textContent = String(err?.message || err);
  } finally {
    $('#status').textContent = '';
  }
}

function renderTable(fields, rows) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  fields.forEach(f => {
    const th = document.createElement('th');
    th.textContent = f;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach(r => {
    const tr = document.createElement('tr');
    r.forEach(v => {
      const td = document.createElement('td');
      td.textContent = v == null ? '' : String(v);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}

document.addEventListener('DOMContentLoaded', () => {
  renderExamples();
  $('#ask').addEventListener('click', runQuery);
});



