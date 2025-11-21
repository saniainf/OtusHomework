<template>
    <section class="search-panel">
        <div class="search-container">
            <label for="search-input" class="search-label">Поиск товаров</label>
            <div class="search-input-wrapper">
                <input id="search-input" v-model="searchLocalValue" type="text" class="search-input" placeholder="Введите название товара..." />
                <button v-if="searchLocalValue" @click="clear" type="button" class="clear-btn" title="Очистить">
                    ×
                </button>
            </div>

            <div v-if="resultsCount !== null" class="results-count">
                Найдено: {{ resultsCount }} {{ productWord }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    searchValue: {
        type: String,
        default: ''
    },
    resultsCount: {
        type: Number,
        default: null
    }
});

const emit = defineEmits(['update:searchValue']);

const searchLocalValue = computed({
    get() {
        return props.searchValue;
    },
    set(value) {
        emit('update:searchValue', value);
    }
});

function clear() {
    emit('update:searchValue', '');
}

/**
 * Правильное склонение слова "товар"
 */
const productWord = computed(() => {
    const count = props.resultsCount;
    if (count === null) return 'товаров';

    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'товаров';
    }

    if (lastDigit === 1) {
        return 'товар';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'товара';
    }

    return 'товаров';
});
</script>

<style scoped>
.search-panel {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.search-container {
    background-color: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    outline: none;
}

.search-input:focus {
    border-color: #42b983;
}

.search-input::placeholder {
    color: #999;
}

.clear-btn {
    position: absolute;
    right: 0.5rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    line-height: 1;
    border-radius: 4px;
}

.clear-btn:hover {
    background-color: #f5f5f5;
    color: #2c3e50;
}

.results-count {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: #666;
    text-align: right;
}
</style>