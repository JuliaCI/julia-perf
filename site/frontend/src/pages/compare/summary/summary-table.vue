<script setup lang="ts">
import {SummaryGroup} from "../data";
import {computed} from "vue";
import SummaryRange from "./range.vue";
import SummaryCount from "./count.vue";
import SummaryPercentValue from "./percent-value.vue";

const props = withDefaults(
  defineProps<{
    summary: SummaryGroup;
    withLegend?: boolean;
  }>(),
  {
    withLegend: true,
  }
);
const summary = computed(() => props.summary);
</script>

<template>
  <div
    v-if="summary.all.count === 0"
    style="
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    "
  >
    <span>No results</span>
  </div>
  <table v-else class="summary-table">
    <thead v-if="withLegend">
      <tr>
        <th><!-- icon --></th>
        <th>Range</th>
        <th>Geo mean</th>
        <th>Median</th>
        <th>Count</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td title="Regressions" v-if="withLegend">❌</td>
        <template v-if="summary.regressions.count !== 0">
          <td>
            <SummaryRange :range="summary.regressions.range" />
          </td>
          <td>
            <SummaryPercentValue :value="summary.regressions.geomean" />
          </td>
          <td>
            <SummaryPercentValue :value="summary.regressions.median" />
          </td>
          <td class="positive">
            <SummaryCount :cases="summary.regressions.count" />
          </td>
        </template>
        <template v-else>
          <td colspan="4" style="text-align: center">No regressions</td>
        </template>
      </tr>
      <tr>
        <td title="Improvements" v-if="withLegend">✅</td>
        <template v-if="summary.improvements.count !== 0">
          <td>
            <SummaryRange :range="summary.improvements.range" />
          </td>
          <td>
            <SummaryPercentValue :value="summary.improvements.geomean" />
          </td>
          <td>
            <SummaryPercentValue :value="summary.improvements.median" />
          </td>
          <td class="negative">
            <SummaryCount :cases="summary.improvements.count" />
          </td>
        </template>
        <template v-else>
          <td colspan="4" style="text-align: center">No improvements</td>
        </template>
      </tr>
      <tr>
        <td title="All changes" v-if="withLegend">❌,✅</td>
        <td>
          <SummaryRange :range="summary.all.range" />
        </td>
        <td>
          <SummaryPercentValue :value="summary.all.geomean" />
        </td>
        <td>
          <SummaryPercentValue :value="summary.all.median" />
        </td>
        <td>
          <SummaryCount :cases="summary.all.count" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped lang="scss">
.summary-table {
  td {
    text-align: right;
  }

  td,
  th {
    padding: 2px 5px;
    vertical-align: middle;
  }
}
</style>
