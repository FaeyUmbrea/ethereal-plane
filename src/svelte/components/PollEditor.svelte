<script>
	import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
	import { localize } from '#runtime/util/i18n';
	import { getConnectionManager } from '../../server/connectionManager.ts';
	import { PollStatus } from '../../utils/polls.ts';
	import { setSetting, settings } from '../../utils/settings.ts';
	import { log } from '../../utils/utils.ts';

	/**
	 * @type {Poll}
	 */
	const poll = settings.getStore('currentPoll');
	let title = '';
	let duration = 30;

	function addOption() {
		if ($poll.options.length >= 5) return;
		const newPoll = $poll;
		newPoll.options.push({
			text: '',
			name: ($poll.options.length + 1).toString(),
		});
		setSetting('currentPoll', newPoll);
	}

	function removeOption() {
		if ($poll.options.length <= 2) return;
		const newPoll = $poll;
		newPoll.options.pop();
		setSetting('currentPoll', newPoll);
	}

	async function startPoll() {
		const newPoll = $poll;
		newPoll.tally = Array.from({ length: newPoll.options.length }).fill(0);
		newPoll.status = PollStatus.starting;
		newPoll.duration = duration;
		newPoll.createdAt = new Date();
		newPoll.title = title || 'Poll';
		await setSetting('currentPoll', newPoll);
		getConnectionManager().createPoll(newPoll);
	}

	const doc = new TJSDocument();

	async function onDrop(event, index) {
		log(`Ethereal Plane | Adding Macro to Poll Option ${index}`);
		try {
			await doc.setFromDataTransfer(
				JSON.parse(event.dataTransfer.getData('text/plain')),
			);
			const newPoll = $poll;
			newPoll.options[index].macro = doc.get().id;
			await setSetting('currentPoll', newPoll);
		} catch (err) {
			console.error(err);
		}
	}

	function onClick(index) {
		const id = $poll.options[index].macro;
		if (!id) return;
		const currentMacro = game.macros.get(id);
		currentMacro.sheet.render(true);
	}

	async function onRClick(index) {
		log(`Ethereal Plane | Removing Macro from Poll Option ${index}`);
		const newPoll = $poll;
		newPoll.options[index].macro = undefined;
		await setSetting('currentPoll', newPoll);
	}
</script>

<div class='editor'>
	<div class='config'>
		<input
			bind:value={title}
			class='title'
			placeholder={localize('ethereal-plane.ui.title')}
			type='text'
		/>
		<input
			bind:value={duration}
			class='duration'
			max={300}
			min={0}
			type='number'
		/>
	</div>
	<div class='options'>
		{#each $poll.options as option, index}
			<label for={index}>{index + 1}</label>
			<input id={index} type='text' bind:value={option.text} />
			<section
				role='none'
				class='macro'
				on:click={() => onClick(index)}
				on:auxclick={() => onRClick(index)}
				on:drop|preventDefault|stopPropagation={e => onDrop(e, index)}
			>
				{#if option.macro}
					<section class='macro'>
						<img alt='Macro Icon' src={game.macros.get(option.macro).img} />
					</section>
				{/if}
			</section>
		{/each}
	</div>
	<div class='buttons'>
		<button
			class='addrem'
			disabled={$poll.options.length >= 5}
			on:click={addOption}
		><i class='fas fa-plus'></i>
		</button>
		<button
			class='addrem'
			disabled={$poll.options.length <= 2}
			on:click={removeOption}
		><i class='fas fa-minus'></i>
		</button>
		<button on:click={startPoll}>{localize('ethereal-plane.ui.start')}</button
		>
	</div>
</div>

<style lang='stylus'>
  .config {
    display: grid;
		gap: 2px;
    grid-template-columns: auto 60px;
    align-content: flex-start;

    input {
      height: 35px;
      font-size: 20px;
    }
  }

  .options {
    display: grid;
    grid-template-columns: 35px auto 35px;
    grid-column-gap: 2px;
    grid-row-gap: 3px;
    align-content: flex-start;

    .macro {
      border: grey 1px solid;
      border-radius: 5px;
      height: 35px;
    }

    input {
      height: 35px;
      font-size: 20px;
    }
  }

  label {
    height: 35px;
    border: 1px solid grey;
    border-radius: 5px;
    text-align: center;
    padding: 3px;
    font-size: 20px;
    width: 35px;
  }

	button {
		height 35px
		width 100%
	}

  button.addrem {
    width: 35px;
  }

  .buttons {
    display: flex;
		gap: 3px;
  }

  .editor {
    height: 100%;
    min-height: 100%;
    display: grid;
    grid-template-rows: 40px auto 35px;
  }

  .macro {
    display: block;
    position: relative;

    img {
      position: absolute;
      left: 0;
      z-index: 0;
    }
  }
</style>
